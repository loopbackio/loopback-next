// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import {AddressInfo} from 'net';
import * as pEvent from 'p-event';
import {
  HttpProtocol,
  HttpServer,
  HttpServerOptions,
  RequestListener,
  ProtocolServerFactory,
} from './types';

/**
 * HTTP / HTTPS server used by LoopBack's RestServer
 *
 * @export
 * @class HttpServer
 */
export class DefaultHttpServer implements HttpServer {
  private _port: number;
  private _host?: string;
  private _listening: boolean = false;
  protected _protocol: string;
  private _urlScheme: string;
  private _address: AddressInfo;
  protected readonly requestListener: RequestListener;
  protected _server: http.Server | https.Server;
  protected readonly serverOptions: HttpServerOptions;

  protected protocolServerFactories: ProtocolServerFactory[];

  /**
   * @param requestListener
   * @param serverOptions
   */
  constructor(
    requestListener: RequestListener,
    serverOptions: HttpServerOptions = {},
    protocolServerFactories?: ProtocolServerFactory[],
  ) {
    this.requestListener = requestListener;
    serverOptions = serverOptions || {};
    this.serverOptions = serverOptions;
    this._port = serverOptions.port || 0;
    this._host = serverOptions.host || undefined;
    this._protocol = serverOptions.protocol || 'http';
    this.protocolServerFactories = protocolServerFactories || [
      new HttpProtocolServerFactory(),
    ];
    const server = this.createServer();
    this._server = server.server;
    this._urlScheme = server.urlScheme;
  }

  /**
   * Create a server for the given protocol
   */
  protected createServer() {
    for (const factory of this.protocolServerFactories) {
      if (factory.supports(this._protocol, this.serverOptions)) {
        const server = factory.createServer(
          this._protocol,
          this.requestListener,
          this.serverOptions,
        );
        if (server) {
          return server;
        }
      }
    }
    throw new Error(`The ${this._protocol} protocol is not supported`);
  }

  /**
   * Starts the HTTP / HTTPS server
   */
  public async start() {
    this._server.listen(this._port, this._host);
    await pEvent(this._server, 'listening');
    this._listening = true;
    this._address = this._server.address() as AddressInfo;
  }

  /**
   * Stops the HTTP / HTTPS server
   */
  public async stop() {
    if (!this._server) return;
    this._server.close();
    await pEvent(this._server, 'close');
    this._listening = false;
  }

  /**
   * Protocol of the HTTP / HTTPS server
   */
  public get protocol(): string {
    return this._urlScheme || this._protocol;
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
    if (this._address && this._address.family === 'IPv6') {
      if (host === '::') host = '::1';
      host = `[${host}]`;
    } else if (host === '0.0.0.0') {
      host = '127.0.0.1';
    }
    return `${this.protocol}://${host}:${this.port}`;
  }

  /**
   * State of the HTTP / HTTPS server
   */
  public get listening(): boolean {
    return this._listening;
  }

  public get server(): http.Server | https.Server {
    return this._server;
  }

  /**
   * Address of the HTTP / HTTPS server
   */
  public get address(): AddressInfo | undefined {
    return this._listening ? this._address : undefined;
  }
}

export class HttpProtocolServerFactory implements ProtocolServerFactory {
  /**
   * Supports http and https
   * @param protocol
   */
  supports(protocol: string) {
    return protocol === 'http' || protocol === 'https';
  }

  /**
   * Create a server for the given protocol
   */
  createServer(
    protocol: string,
    requestListener: RequestListener,
    serverOptions: HttpServerOptions,
  ) {
    if (protocol === 'https') {
      const server = https.createServer(
        serverOptions as https.ServerOptions,
        requestListener,
      );
      return {server, urlScheme: protocol};
    } else if (protocol === 'http') {
      const server = http.createServer(requestListener);
      return {server, urlScheme: protocol};
    }
    throw new Error(`The ${protocol} protocol is not supported`);
  }
}
