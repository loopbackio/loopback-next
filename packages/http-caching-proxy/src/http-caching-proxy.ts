// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import axios, {AxiosInstance, Method} from 'axios';
import debugFactory from 'debug';
import {once} from 'events';
import {
  createServer,
  IncomingMessage,
  OutgoingHttpHeaders,
  Server as HttpServer,
  ServerResponse,
} from 'http';
import {AddressInfo} from 'net';

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
  private _axios: AxiosInstance;
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
    this._axios = axios.create({
      // Provide a custom function to control when Axios throws errors based on
      // http status code. Please note that Axios creates a new error in such
      // condition and the original low-level error is lost
      validateStatus: () => true,
    });
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
      // Reject tunneling requests
      socket.write('HTTP/1.1 501 Not Implemented\r\n\r\n');
      socket.destroy();
    });

    this._server.listen(this._options.port);
    await once(this._server, 'listening');

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
    await once(server, 'close');
  }

  private _handle(request: IncomingMessage, response: ServerResponse) {
    const onerror = (error: Error) => {
      this.logError(request, error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.statusCode = (error as any).statusCode || 502;
      response.end(`${error.name}: ${error.message}`);
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

    const backendResponse = await this._axios({
      method: clientRequest.method as Method,
      url: clientRequest.url!,
      headers: clientRequest.headers,
      data: clientRequest,
      // Set the response type to `arraybuffer` to force the `data` to be a
      // Buffer to allow ease of caching
      // Since this proxy is for testing only, buffering the entire
      // response body is acceptable.
      responseType: 'arraybuffer',
      timeout: this._options.timeout || undefined,
    });

    debug(
      'Got response for %s %s -> %s',
      clientRequest.method,
      clientRequest.url,
      backendResponse.status,
      backendResponse.headers,
      backendResponse.data,
    );

    const metadata: CachedMetadata = {
      statusCode: backendResponse.status,
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

    const data = backendResponse.data;

    await cacache.put(
      this._options.cachePath,
      this._getCacheKey(clientRequest),
      data,
      {metadata},
    );

    clientResponse.writeHead(backendResponse.status, backendResponse.headers);
    clientResponse.end(data);
  }

  public logError(request: IncomingMessage, error: Error) {
    if (this._options.logError) {
      console.error(
        'Cannot proxy %s %s.',
        request.method,
        request.url,
        error.stack ?? error,
      );
    } else {
      debug(
        'Cannot proxy %s %s.',
        request.method,
        request.url,
        error.stack ?? error,
      );
    }
  }
}
