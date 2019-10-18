// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {
  createServer,
  IncomingMessage,
  OutgoingHttpHeaders,
  Server as HttpServer,
  ServerResponse,
} from 'http';
import {AddressInfo} from 'net';
import pEvent from 'p-event';
import * as makeRequest from 'request-promise-native';

const cacache = require('cacache');

const debug = debugFactory('loopback:http-caching-proxy');

export interface ProxyOptions {
  /**
   * Directory where to keep the cached snapshots.
   */
  cachePath: string;

  /**
   * How long to keep snapshots before making a new request to the backend.
   * The value is in milliseconds.
   *
   * Default: one day
   */
  ttl?: number;

  /**
   * The port where the HTTP proxy should listen at.
   * Default: 0 (let the system pick a free port)
   */
  port?: number;

  /**
   * A flag if the error should be logged
   */
  logError?: boolean;

  /**
   * Timeout to connect to the target service
   */
  timeout?: number;
}

const DEFAULT_OPTIONS = {
  port: 0,
  ttl: 24 * 60 * 60 * 1000,
  logError: true,
  timeout: 0,
};

interface CachedMetadata {
  statusCode: number;
  headers: OutgoingHttpHeaders;
  createdAt: number;
}

/**
 * The HTTP proxy implementation.
 */
export class HttpCachingProxy {
  private _options: Required<ProxyOptions>;
  private _server?: HttpServer;

  /**
   * URL where the proxy is listening on.
   * Provide this value to your HTTP client as the proxy configuration.
   */
  public url: string;

  constructor(options: ProxyOptions) {
    this._options = Object.assign({}, DEFAULT_OPTIONS, options);
    if (!this._options.cachePath) {
      throw new Error('Required option missing: "cachePath"');
    }
    this.url = 'http://proxy-not-running';
    this._server = undefined;
  }

  /**
   * Start listening.
   */
  async start() {
    this._server = createServer(
      (request: IncomingMessage, response: ServerResponse) => {
        this._handle(request, response);
      },
    );

    this._server.on('connect', (req, socket) => {
      socket.write('HTTP/1.1 501 Not Implemented\r\n\r\n');
      socket.destroy();
    });

    this._server.listen(this._options.port);
    await pEvent(this._server, 'listening');

    const address = this._server.address() as AddressInfo;
    this.url = `http://127.0.0.1:${address.port}`;
  }

  /**
   * Stop listening.
   */
  async stop() {
    if (!this._server) return;

    this.url = 'http://proxy-not-running';
    const server = this._server;
    this._server = undefined;

    server.close();
    await pEvent(server, 'close');
  }

  private _handle(request: IncomingMessage, response: ServerResponse) {
    const onerror = (error: Error) => {
      this.logError(request, error);
      response.statusCode = error.name === 'RequestError' ? 502 : 500;
      response.end(error.message);
    };

    try {
      this._handleAsync(request, response).catch(onerror);
    } catch (err) {
      onerror(err);
    }
  }

  private async _handleAsync(
    request: IncomingMessage,
    response: ServerResponse,
  ) {
    debug(
      'Incoming request %s %s',
      request.method,
      request.url,
      request.headers,
    );

    const cacheKey = this._getCacheKey(request);

    try {
      const entry = await cacache.get(this._options.cachePath, cacheKey);
      if (entry.metadata.createdAt + this._options.ttl > Date.now()) {
        debug('Sending cached response for %s', cacheKey);
        this._sendCachedEntry(entry.data, entry.metadata, response);
        return;
      }
      debug('Cache entry expired for %s', cacheKey);
      // (continue to forward the request)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Cannot load cached entry.', error);
      }
      debug('Cache miss for %s', cacheKey);
      // (continue to forward the request)
    }

    await this._forwardRequest(request, response);
  }

  private _getCacheKey(request: IncomingMessage): string {
    // TODO(bajtos) consider adding selected/all headers to the key
    return `${request.method} ${request.url}`;
  }

  private _sendCachedEntry(
    data: Buffer,
    metadata: CachedMetadata,
    response: ServerResponse,
  ) {
    response.writeHead(metadata.statusCode, metadata.headers);
    response.end(data);
  }

  private async _forwardRequest(
    clientRequest: IncomingMessage,
    clientResponse: ServerResponse,
  ) {
    debug('Forward request to %s %s', clientRequest.method, clientRequest.url);
    const backendResponse = await makeRequest({
      resolveWithFullResponse: true,
      simple: false,

      method: clientRequest.method,
      uri: clientRequest.url!,
      headers: clientRequest.headers,
      body: clientRequest,
      timeout: this._options.timeout || undefined,
    });

    debug(
      'Got response for %s %s -> %s',
      clientRequest.method,
      clientRequest.url,
      backendResponse.statusCode,
      backendResponse.headers,
    );

    const metadata: CachedMetadata = {
      statusCode: backendResponse.statusCode,
      headers: backendResponse.headers,
      createdAt: Date.now(),
    };

    // Ideally, we should pipe the backend response to both
    // client response and cachache.put.stream.
    //   r.pipe(clientResponse);
    //   r.pipe(cacache.put.stream(...))
    // To do so, we would have to defer .end() call on the client
    // response until the content is stored in the cache,
    // which is rather complex and involved.
    // Without that synchronization, the client can start sending
    // follow-up requests that won't be served from the cache as
    // the cache has not been updated yet.
    // Since this proxy is for testing only, buffering the entire
    // response body is acceptable.

    await cacache.put(
      this._options.cachePath,
      this._getCacheKey(clientRequest),
      backendResponse.body,
      {metadata},
    );

    clientResponse.writeHead(
      backendResponse.statusCode,
      backendResponse.headers,
    );
    clientResponse.end(backendResponse.body);
  }

  public logError(request: IncomingMessage, error: Error) {
    if (this._options.logError) {
      console.error(
        'Cannot proxy %s %s.',
        request.method,
        request.url,
        error.stack || error,
      );
    } else {
      debug(
        'Cannot proxy %s %s.',
        request.method,
        request.url,
        error.stack || error,
      );
    }
  }
}
