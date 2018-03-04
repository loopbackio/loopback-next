// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';

import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server');

/**
 * Plain HTTP request listener
 */
export type HttpRequestListener = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => void;

/**
 * An interface for objects that have a `requestListener` function to handle
 * http requests/responses
 */
export interface HttpServerLike {
  requestListener: HttpRequestListener;
}

/**
 * Options to configure the http server
 */
export type HttpServerConfig = {
  /**
   * Protocol, default to `http`
   */
  protocol?: 'http' | 'https'; // Will be extended to `http2` in the future
  /**
   * Port number, default to `0` (ephemeral)
   */
  port?: number;
  /**
   * Host names/addresses to listen on
   */
  host?: string;
  /**
   * Options for https, such as `cert` and `key`.
   */
  httpsServerOptions?: https.ServerOptions;
};

/**
 * Http endpoint
 */
export interface BaseHttpEndpoint<REQ, RES, APP> extends HttpServerLike {
  server: http.Server | https.Server;
  url: string;
  /**
   * Protocol, default to `http`
   */
  protocol?: 'http' | 'https'; // Will be extended to `http2` in the future
  /**
   * Port number, default to `0` (ephemeral)
   */
  port?: number;
  /**
   * Host names/addresses to listen on
   */
  host?: string;
  app?: APP; // Such as Express or Koa `app`
  start(): Promise<string>;
  stop(): Promise<void>;
  use(handler: BaseHttpHandler<REQ, RES>): void;
}

/**
 * This interface wraps http request/response and other information. It's
 * designed to be used by `http-server-*` modules to provide the concrete
 * types for `REQ` and `RES`.
 */
export interface BaseHttpContext<REQ, RES> {
  /**
   * The Node.js core http request
   */
  req: http.IncomingMessage;
  /**
   * The Node.js core http response
   */
  res: http.ServerResponse;
  /**
   * Framework specific http request. For example `Express` has its own
   * `Request` that extends from `http.IncomingMessage`
   */
  request: REQ;
  /**
   * Framework specific http response. For example `Express` has its own
   * `Response` that extends from `http.ServerResponse`
   */
  response: RES;
  /**
   * Next handler
   */
  // tslint:disable-next-line:no-any
  next?: (() => Promise<any>) | ((err: any) => void);
}

/**
 * Http request/response handler. It's designed to be used by `http-server-*`
 * modules to provide the concrete types for `REQ` and `RES`.
 */
export type BaseHttpHandler<REQ, RES> = (
  httpCtx: BaseHttpContext<REQ, RES>,
) => Promise<void>;

/**
 * Create an endpoint for the given REST server configuration
 */
export interface HttpFactory<REQ, RES, APP> {
  /**
   * Create an http/https endpoint for the configuration and handler. Please
   * note the endpoint has not started listening on the port yet. We need to
   * call `endpoint.start()` to listen.
   *
   * @param config The configuration for the http server
   * @param handler The http request/response handler
   */
  createEndpoint(
    config: HttpServerConfig,
    handler: BaseHttpHandler<REQ, RES>,
  ): BaseHttpEndpoint<REQ, RES, APP>;

  /**
   * Create a corresponding http context for the plain http request/response
   * @param req
   * @param res
   */
  createHttpContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    app: APP,
  ): BaseHttpContext<REQ, RES>;

  createApp(): APP;
}

export class DefaultHttpEndpoint<REQ, RES, APP>
  implements BaseHttpEndpoint<REQ, RES, APP> {
  url: string;
  /**
   * Protocol, default to `http`
   */
  protocol?: 'http' | 'https'; // Will be extended to `http2` in the future
  /**
   * Port number, default to `0` (ephemeral)
   */
  port?: number;
  /**
   * Host names/addresses to listen on
   */
  host?: string;

  constructor(
    private config: HttpServerConfig,
    public server: http.Server | https.Server,
    public requestListener: HttpRequestListener,
    // tslint:disable-next-line:no-any
    public app?: any, // Such as Express or Koa `app`
  ) {
    this.host = config.host;
    this.port = config.port;
    this.protocol = config.protocol;
  }

  use(httpHandler: BaseHttpHandler<REQ, RES>) {
    throw new Error('Middleware is not supported');
  }

  start() {
    this.server.listen(this.config.port, this.config.host);

    return new Promise<string>((resolve, reject) => {
      this.server.once('listening', () => {
        const address = this.server.address();
        this.config.host = this.host = this.host || address.address;
        this.config.port = this.port = address.port;
        this.config.protocol = this.protocol = this.protocol || 'http';
        if (address.family === 'IPv6') {
          this.host = `[${this.host}]`;
        }
        if (process.env.TRAVIS) {
          // Travis CI seems to have trouble connecting to '[::]' or '[::1]'
          // Set host to `127.0.0.1`
          if (address.address === '::' || address.address === '0.0.0.0') {
            this.host = '127.0.0.1';
          }
        }
        this.url = `${this.protocol}://${this.host}:${this.port}`;
        debug('Server is ready at %s', this.url);
        resolve(this.url);
      });
      this.server.once('error', reject);
    });
  }

  stop() {
    return new Promise<void>((resolve, reject) => {
      // tslint:disable-next-line:no-any
      this.server.close((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
