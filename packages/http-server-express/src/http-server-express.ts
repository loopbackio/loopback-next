// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server-express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server:express');

import {
  BaseHttpContext,
  BaseHttpHandler,
  HttpFactory,
  BaseHttpEndpoint,
  HttpServerConfig,
  DefaultHttpEndpoint,
} from '@loopback/http-server';

import * as express from 'express';
import {Request, Response, Application as HttpApplication} from 'express';

export {
  Request,
  Response,
  NextFunction,
  Application as HttpApplication,
} from 'express';

export {
  HttpServerConfig,
  HttpRequestListener,
  HttpServerLike,
} from '@loopback/http-server';

export type HttpContext = BaseHttpContext<Request, Response>;
export type HttpHandler = BaseHttpHandler<Request, Response>;
export type HttpEndpoint = BaseHttpEndpoint<Request, Response, HttpApplication>;

function toMiddleware(handler: HttpHandler): express.RequestHandler {
  return (request, response, next) => {
    debug('Handling request: %s', request.originalUrl);
    const httpCtx: HttpContext = {
      req: request,
      res: response,
      request,
      response,
      next,
    };
    handler(httpCtx)
      .then(() => {
        debug('Finishing request: %s', request.originalUrl);
        next();
      })
      .catch(err => next(err));
  };
}

class ExpressHttpFactory
  implements HttpFactory<Request, Response, HttpApplication> {
  createEndpoint(config: HttpServerConfig, handler: HttpHandler) {
    // Create an express representing the server endpoint
    const app = express() as HttpApplication;
    app.use(toMiddleware(handler));

    let server: http.Server | https.Server;
    if (config.protocol === 'https') {
      server = https.createServer(config.httpsServerOptions || {}, app);
    } else {
      // default to http
      server = http.createServer(app);
    }
    return new ExpressHttpEndpoint(config, server, app, app);
  }

  createHttpContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): HttpContext {
    // Run the express middleware to parse query parameters
    // tslint:disable-next-line:no-any
    expressQuery()(req, res, (err: any) => {
      if (err) throw err;
    });
    const request = Object.setPrototypeOf(req, expressRequest);
    const response = Object.setPrototypeOf(res, expressResponse);
    return {
      req,
      res,
      request,
      response,
    };
  }

  createApp() {
    return express() as HttpApplication;
  }
}

class ExpressHttpEndpoint extends DefaultHttpEndpoint<
  Request,
  Response,
  HttpApplication
> {
  use(handler: HttpHandler) {
    const app = this.app;
    app.use(toMiddleware(handler));
  }
}

export const HTTP_FACTORY: HttpFactory<
  Request,
  Response,
  HttpApplication
> = new ExpressHttpFactory();

const {
  request: expressRequest,
  response: expressResponse,
  query: expressQuery,
} = require('express');
