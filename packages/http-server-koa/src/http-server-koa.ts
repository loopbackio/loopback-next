// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server-koa
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server:koa');

import {
  BaseHttpContext,
  BaseHttpHandler,
  HttpFactory,
  BaseHttpEndpoint,
  HttpServerConfig,
  DefaultHttpEndpoint,
} from '@loopback/http-server';

import * as Koa from 'koa';

import {Request, Response} from 'koa';
export {Request, Response} from 'koa';

export {
  HttpServerConfig,
  HttpRequestListener,
  HttpServerLike,
} from '@loopback/http-server';

export type HttpApplication = Koa;
export type HttpContext = BaseHttpContext<Request, Response>;
export type HttpHandler = BaseHttpHandler<Request, Response>;
export type HttpEndpoint = BaseHttpEndpoint<Request, Response, HttpApplication>;

function toMiddleware(handler: HttpHandler): Koa.Middleware {
  return async (koaCtx, next) => {
    debug('Handling request: %s', koaCtx.request.originalUrl);
    const httpCtx: HttpContext = {
      req: koaCtx.req,
      res: koaCtx.res,
      request: koaCtx.request,
      response: koaCtx.response,
      next: next,
    };
    await handler(httpCtx);
    debug('Finishing request: %s', koaCtx.request.originalUrl);
    await next();
  };
}

class koaHttpFactory
  implements HttpFactory<Request, Response, HttpApplication> {
  createEndpoint(config: HttpServerConfig, handler: HttpHandler) {
    // Create an koa representing the server endpoint
    const app = new Koa();
    app.use(toMiddleware(handler));

    const requestHandler = app.callback();
    let server: http.Server | https.Server;
    if (config.protocol === 'https') {
      server = https.createServer(
        config.httpsServerOptions || {},
        requestHandler,
      );
    } else {
      // default to http
      server = http.createServer(requestHandler);
    }

    return new KoaHttpEndpoint(config, server, requestHandler, app);
  }

  createHttpContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    app: HttpApplication,
  ): HttpContext {
    return app.createContext(req, res);
  }

  createApp() {
    return new Koa();
  }
}

class KoaHttpEndpoint extends DefaultHttpEndpoint<
  Request,
  Response,
  HttpApplication
> {
  use(handler: HttpHandler) {
    const koa = this.app;
    koa.use(toMiddleware(handler));
  }
}

export const HTTP_FACTORY: HttpFactory<
  Request,
  Response,
  HttpApplication
> = new koaHttpFactory();
