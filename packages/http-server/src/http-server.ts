// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as https from 'https';
import {AddressInfo} from 'net';
import * as pEvent from 'p-event';
import * as spdy from 'spdy';

export type RequestListener = (
  req: IncomingMessage,
  res: ServerResponse,
) => void;

/**
 * Basic HTTP server listener options
 *
 * @export
 * @interface ListenerOptions
 */
export interface ListenerOptions {
  host?: string;
  port?: number;
}

/**
 * HTTP server options
 *
 * @export
 * @interface HttpOptions
 */
export interface HttpOptions extends ListenerOptions {
  protocol?: 'http';
}

/**
 * HTTPS server options
 *
 * @export
 * @interface HttpsOptions
 */
export interface HttpsOptions extends ListenerOptions, https.ServerOptions {
  protocol: 'https';
}

/**
 * HTTP/2 server options based on `spdy`
 */
export interface Http2Options extends ListenerOptions, spdy.ServerOptions {
  protocol: 'http2' | 'https';
}

/**
 * Possible server options
 *
 * @export
 * @type HttpServerOptions
 */
export type HttpServerOptions = HttpOptions | HttpsOptions | Http2Options;

/**
 * Supported protocols
 *
 * @export
 * @type HttpProtocol
 */
export type HttpProtocol = 'http' | 'https' | 'http2';

/**
 * HTTP / HTTPS server used by LoopBack's RestServer
 *
 * @export
 * @class HttpServer
 */
export class HttpServer {
  private _port: number;
  private _host?: string;
  private _listening: boolean = false;
  private _protocol: HttpProtocol;
  private _address: AddressInfo;
  private requestListener: RequestListener;
  readonly server: http.Server | https.Server;
  private serverOptions?: HttpServerOptions;

  /**
   * @param requestListener
   * @param serverOptions
   */
  constructor(
    requestListener: RequestListener,
    serverOptions: HttpServerOptions = {},
  ) {
    this.requestListener = requestListener;
    this.serverOptions = serverOptions;
    this._port = serverOptions ? serverOptions.port || 0 : 0;
    this._host = serverOptions ? serverOptions.host : undefined;
    this._protocol = serverOptions ? serverOptions.protocol || 'http' : 'http';
    if (
      this._protocol === 'http2' ||
      (this._protocol === 'https' && serverOptions.hasOwnProperty('spdy'))
    ) {
      this.server = spdy.createServer(
        this.serverOptions as spdy.ServerOptions,
        this.requestListener,
      );
    } else if (this._protocol === 'https') {
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
    this.server.listen(this._port, this._host);
    await pEvent(this.server, 'listening');
    this._listening = true;
    this._address = this.server.address() as AddressInfo;
  }

  /**
   * Stops the HTTP / HTTPS server
   */
  public async stop() {
    if (!this.server) return;
    if (!this.server.listening) return;
    await new Promise<void>((resolve, reject) => {
      this.server.close((err: unknown) => {
        if (!err) resolve();
        else reject(err);
      });
    });

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
    return (this._address && this._address.port) || this._port;
  }

  /**
   * Host of the HTTP / HTTPS server
   */
  public get host(): string | undefined {
    return (this._address && this._address.address) || this._host;
  }

  /**
   * URL of the HTTP / HTTPS server
   */
  public get url(): string {
    let host = this.host;
    if (this._address.family === 'IPv6') {
      if (host === '::') host = '::1';
      host = `[${host}]`;
    } else if (host === '0.0.0.0') {
      host = '127.0.0.1';
    }
    const protocol = this._protocol === 'http2' ? 'https' : this._protocol;
    return `${protocol}://${host}:${this.port}`;
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
  public get address(): AddressInfo | undefined {
    return this._listening ? this._address : undefined;
  }
}
