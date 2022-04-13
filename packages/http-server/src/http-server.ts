// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import debugFactory from 'debug';
import {once} from 'events';
import http, {IncomingMessage, Server, ServerResponse} from 'http';
import https from 'https';
import {AddressInfo, ListenOptions} from 'net';
import os from 'os';
import stoppable from 'stoppable';
const debug = debugFactory('loopback:http-server');

/**
 * Request listener function for http/https requests
 */
export type RequestListener = (
  req: IncomingMessage,
  res: ServerResponse,
) => void;

/**
 * The following are for configuring properties which are directly set on
 * https://nodejs.org/api/http.html#http_class_http_server and
 * https://nodejs.org/api/net.html#net_class_net_server
 */
export type HttpServerProperties = Pick<
  Server,
  | 'keepAliveTimeout'
  | 'headersTimeout'
  | 'maxConnections'
  | 'maxHeadersCount'
  | 'timeout'
>;

/**
 * Base options that are common to http and https servers
 */
export interface BaseHttpOptions
  extends ListenOptions,
    Partial<HttpServerProperties> {
  /**
   * The `gracePeriodForClose` property controls how to stop the server
   * gracefully. Its value is the number of milliseconds to wait before
   * in-flight requests finish when the server is being stopped. With this
   * setting, we also reject new requests from existing keep-alive connections
   * in addition to stopping accepting new connections.
   *
   * Defaults to Infinity (don't force-close). If you want to immediately
   * destroy all sockets set its value to `0`.
   *
   * See {@link https://www.npmjs.com/package/stoppable | stoppable}
   */
  gracePeriodForClose?: number;
}

/**
 * HTTP server options
 */
export interface HttpOptions extends BaseHttpOptions {
  protocol?: 'http';
}

/**
 * HTTPS server options
 */
export interface HttpsOptions extends BaseHttpOptions, https.ServerOptions {
  protocol: 'https';
}

/**
 * Possible server options
 *
 */
export type HttpServerOptions = HttpOptions | HttpsOptions;

/**
 * Supported protocols
 *
 */
export type HttpProtocol = 'http' | 'https'; // Will be extended to `http2` in the future

/**
 * HTTP / HTTPS server used by LoopBack's RestServer
 */
export class HttpServer {
  private _listening = false;
  private _protocol: HttpProtocol;
  private _address: string | AddressInfo;
  private requestListener: RequestListener;
  readonly server: http.Server | https.Server;
  private _stoppable: stoppable.StoppableServer;
  readonly serverOptions: HttpServerOptions;

  /**
   * @param requestListener
   * @param serverOptions
   */
  constructor(
    requestListener: RequestListener,
    serverOptions?: HttpServerOptions,
  ) {
    debug('Http server options', serverOptions);
    this.requestListener = requestListener;
    this.serverOptions = {
      port: 0,
      host: undefined,
      ...serverOptions,
    };
    if (this.serverOptions.path) {
      debug('Http server with IPC path %s', this.serverOptions.path);
      const ipcPath = this.serverOptions.path;
      checkNamedPipe(ipcPath);
      // Remove `port` so that `path` is honored
      delete this.serverOptions.port;
    }
    this._protocol = serverOptions ? serverOptions.protocol ?? 'http' : 'http';
    if (this._protocol === 'https') {
      this.server = https.createServer(
        this.serverOptions as https.ServerOptions,
        this.requestListener,
      );
    } else {
      this.server = http.createServer(this.requestListener);
    }

    // Apply server properties
    const {
      keepAliveTimeout,
      headersTimeout,
      maxConnections,
      maxHeadersCount,
      timeout,
    } = this.serverOptions;
    if (keepAliveTimeout) {
      this.server.keepAliveTimeout = keepAliveTimeout;
    }
    if (headersTimeout) {
      this.server.headersTimeout = headersTimeout;
    }
    if (maxConnections) {
      this.server.maxConnections = maxConnections;
    }
    if (maxHeadersCount) {
      this.server.maxHeadersCount = maxHeadersCount;
    }
    if (timeout) {
      this.server.timeout = timeout;
    }

    // Set up graceful stop for http server
    if (typeof this.serverOptions.gracePeriodForClose === 'number') {
      debug(
        'Http server gracePeriodForClose %d',
        this.serverOptions.gracePeriodForClose,
      );
      this._stoppable = stoppable(
        this.server,
        this.serverOptions.gracePeriodForClose,
      );
    }
  }

  /**
   * Starts the HTTP / HTTPS server
   */
  public async start() {
    debug('Starting http server', this.serverOptions);
    this.server.listen(this.serverOptions);
    await once(this.server, 'listening');
    this._listening = true;

    const address = this.server.address();
    assert(address != null);
    this._address = address!;
    debug('Http server is listening on', this.url);
  }

  /**
   * Stops the HTTP / HTTPS server
   */
  public async stop() {
    if (!this._listening) return;
    debug('Stopping http server');
    if (this._stoppable != null) {
      debug('Stopping http server with graceful close');
      this._stoppable.stop();
    } else {
      this.server.close();
    }
    await once(this.server, 'close');
    this._listening = false;
    debug('Http server is stopped');
  }

  /**
   * Protocol of the HTTP / HTTPS server
   */
  public get protocol(): HttpProtocol {
    return this._protocol;
  }

  /**
   * Port number of the HTTP / HTTPS server
   */
  public get port(): number {
    if (typeof this._address === 'string') return 0;
    return this._address?.port || this.serverOptions.port!;
  }

  /**
   * Host of the HTTP / HTTPS server
   */
  public get host(): string | undefined {
    if (typeof this._address === 'string') return undefined;
    return this._address?.address || this.serverOptions.host;
  }

  /**
   * URL of the HTTP / HTTPS server
   */
  public get url(): string {
    if (typeof this._address === 'string') {
      /* istanbul ignore if */
      if (isWin32()) {
        return this._address;
      }
      const basePath = encodeURIComponent(this._address);
      return `${this.protocol}+unix://${basePath}`;
    }
    let host = this.host;
    if ([6, 'IPv6'].includes(this._address.family)) {
      if (host === '::') host = '::1';
      host = `[${host}]`;
    } else if (host === '0.0.0.0') {
      host = '127.0.0.1';
    }
    return `${this._protocol}://${host}:${this.port}`;
  }

  /**
   * State of the HTTP / HTTPS server
   */
  public get listening(): boolean {
    return this._listening;
  }

  /**
   * Address of the HTTP / HTTPS server
   */
  public get address(): string | AddressInfo | undefined {
    return this._listening ? this._address : undefined;
  }
}

/**
 * Makes sure `path` conform to named pipe naming requirement on Windows
 *
 * See https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections
 *
 * @param ipcPath - Named pipe path
 */
function checkNamedPipe(ipcPath: string) {
  /* istanbul ignore if */
  if (isWin32()) {
    const pipes = ['\\\\?\\pipe\\', '\\\\.\\pipe\\'];
    assert(
      pipes.some(p => ipcPath.startsWith(p)),
      `Named pipe ${ipcPath} does NOT start with + ${pipes.join(' or ')}`,
    );
  }
}

/**
 * Check if it's Windows OS
 */
function isWin32() {
  return os.platform() === 'win32';
}
