// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createServer, Server, ServerRequest, ServerResponse} from 'http';
import {AddressInfo} from 'net';
import * as pEvent from 'p-event';

export type HttpRequestListener = (
  req: ServerRequest,
  res: ServerResponse,
) => void;

/**
 * Object for specifyig the HTTP / HTTPS server options
 */
export type HttpServerOptions = {
  port?: number;
  host?: string;
  protocol?: HttpProtocol;
};

export type HttpProtocol = 'http' | 'https'; // Will be extended to `http2` in the future

/**
 * HTTP / HTTPS server used by LoopBack's RestServer
 *
 * @export
 * @class HttpServer
 */
export class HttpServer {
  private _port: number;
  private _host?: string;
  private _started: Boolean;
  private _protocol: HttpProtocol;
  private _address: AddressInfo;
  private httpRequestListener: HttpRequestListener;
  private httpServer: Server;

  /**
   * @param httpServerOptions
   * @param httpRequestListener
   */
  constructor(
    httpRequestListener: HttpRequestListener,
    httpServerOptions?: HttpServerOptions,
  ) {
    this.httpRequestListener = httpRequestListener;
    if (!httpServerOptions) httpServerOptions = {};
    this._port = httpServerOptions.port || 0;
    this._host = httpServerOptions.host || undefined;
    this._protocol = httpServerOptions.protocol || 'http';
  }

  /**
   * Starts the HTTP / HTTPS server
   */
  public async start() {
    this.httpServer = createServer(this.httpRequestListener);
    this.httpServer.listen(this._port, this._host);
    await pEvent(this.httpServer, 'listening');
    this._started = true;
    this._address = this.httpServer.address() as AddressInfo;
  }

  /**
   * Stops the HTTP / HTTPS server
   */
  public async stop() {
    if (this.httpServer) {
      this.httpServer.close();
      await pEvent(this.httpServer, 'close');
      this._started = false;
    }
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
    return `${this._protocol}://${this.host}:${this.port}`;
  }

  /**
   * State of the HTTP / HTTPS server
   */
  public get started(): Boolean {
    return this._started;
  }

  /**
   * Address of the HTTP / HTTPS server
   */
  public get address(): AddressInfo {
    return this._address;
  }
}
