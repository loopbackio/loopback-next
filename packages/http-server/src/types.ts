import {AddressInfo} from 'net';
import * as http from 'http';
import * as https from 'https';
import {IncomingMessage, ServerResponse} from 'http';

// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
 * HTTP/2 server options
 *
 * @export
 * @interface Http2Options
 */
export interface Http2Options extends ListenerOptions {
  protocol: 'http2';
  // Other options for a module like https://github.com/spdy-http2/node-spdy
  [name: string]: unknown;
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
export interface HttpServer {
  readonly server: http.Server | https.Server;
  readonly protocol: string;
  readonly port: number;
  readonly host: string | undefined;
  readonly url: string;
  readonly listening: boolean;
  readonly address: AddressInfo | undefined;

  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface ProtocolServer {
  server: http.Server | https.Server;
  /**
   * Scheme for the URL
   */
  urlScheme: string;
}

export interface ProtocolServerFactory {
  supports(protocol: string, serverOptions: HttpServerOptions): boolean;

  createServer(
    protocol: string,
    requestListener: RequestListener,
    serverOptions: HttpServerOptions,
  ): ProtocolServer;
}
