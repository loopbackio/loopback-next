// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import {
  BaseHttpContext,
  BaseHttpHandler,
  HttpFactory,
  BaseHttpEndpoint,
  HttpServerConfig,
  HttpRequestListener,
  DefaultHttpEndpoint,
} from './common';
import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server:core');

/**
 * Export specific types from this implementation
 */
export type Request = http.IncomingMessage;
export type Response = http.ServerResponse;
export type HttpApplication = undefined;
export type HttpContext = BaseHttpContext<Request, Response>;
export type HttpHandler = BaseHttpHandler<Request, Response>;
export type HttpEndpoint = BaseHttpEndpoint<Request, Response, HttpApplication>;

class CoreHttpFactory
  implements HttpFactory<Request, Response, HttpApplication> {
  createEndpoint(config: HttpServerConfig, handler: HttpHandler): HttpEndpoint {
    const requestListener: HttpRequestListener = (request, response) =>
      handler({req: request, res: response, request, response});
    let server: http.Server | https.Server;
    if (config.protocol === 'https') {
      debug('Creating https server: %s:%d', config.host || '', config.port);
      server = https.createServer(
        config.httpsServerOptions || {},
        requestListener,
      );
    } else {
      debug('Creating http server: %s:%d', config.host || '', config.port);
      server = http.createServer(requestListener);
    }

    return new DefaultHttpEndpoint<Request, Response, HttpApplication>(
      config,
      server,
      requestListener,
    );
  }

  createHttpContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    app: HttpApplication,
  ): HttpContext {
    return {
      req,
      res,
      request: req,
      response: res,
    };
  }

  createApp() {
    return undefined;
  }
}

/**
 * A singleton instance of the core http endpoint factory
 */
export const HTTP_FACTORY: HttpFactory<
  Request,
  Response,
  HttpApplication
> = new CoreHttpFactory();
