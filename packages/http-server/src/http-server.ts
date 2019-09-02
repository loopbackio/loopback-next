// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as https from 'https';
import {AddressInfo, ListenOptions} from 'net';
import * as os from 'os';
import pEvent from 'p-event';

export type RequestListener = (
  req: IncomingMessage,
  res: ServerResponse,
) => void;

/**
 * HTTP server options
 *
 */
export interface HttpOptions extends ListenOptions {
  protocol?: 'http';
}

/**
 * HTTPS server options
 *
 */
export interface HttpsOptions extends ListenOptions, https.ServerOptions {
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
  private serverOptions: HttpServerOptions;

  /**
   * @param requestListener
   * @param serverOptions
   */
  constructor(
    requestListener: RequestListener,
    serverOptions?: HttpServerOptions,
  ) {
    this.requestListener = requestListener;
    this.serverOptions = Object.assign(
      {port: 0, host: undefined},
      serverOptions,
    );
    if (this.serverOptions.path) {
      const ipcPath = this.serverOptions.path;
      checkNamedPipe(ipcPath);
      // Remove `port` so that `path` is honored
      delete this.serverOptions.port;
    }
    this._protocol = serverOptions ? serverOptions.protocol || 'http' : 'http';
    if (this._protocol === 'https') {
      this.server = https.createServer(
        this.serverOptions as https.ServerOptions,
        this.requestListener,
      );
    } else {
      this.server = http.createServer(this.requestListener);
    }
  }

  /**
   * Starts the HTTP / HTTPS server
   */
  public async start() {
    this.server.listen(this.serverOptions);
    await pEvent(this.server, 'listening');
    this._listening = true;

    const address = this.server.address();
    assert(address != null);
    this._address = address!;
  }

  /**
   * Stops the HTTP / HTTPS server
   */
  public async stop() {
    if (!this._listening) return;
    this.server.close();
    await pEvent(this.server, 'close');
    this._listening = false;
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
    return (this._address && this._address.port) || this.serverOptions.port!;
  }

  /**
   * Host of the HTTP / HTTPS server
   */
  public get host(): string | undefined {
    if (typeof this._address === 'string') return undefined;
    return (this._address && this._address.address) || this.serverOptions.host;
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
    if (this._address.family === 'IPv6') {
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
