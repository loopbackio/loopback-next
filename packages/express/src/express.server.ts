// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  Context,
  CoreBindings,
  inject,
  Server,
} from '@loopback/core';
import {HttpOptions, HttpServer, HttpsOptions} from '@loopback/http-server';
import debugFactory from 'debug';
import express from 'express';
import {toExpressMiddleware} from './middleware';
import {BaseMiddlewareRegistry} from './middleware-registry';
import {getMiddlewareContext, MiddlewareContext, Request} from './types';

const debug = debugFactory('loopback:middleware');

/**
 * Configuration for a LoopBack based Express server
 */
export type ExpressServerConfig = (HttpOptions | HttpsOptions) & {
  /**
   * Base path to mount the LoopBack middleware chain
   */
  basePath?: string;
  /**
   * Express settings
   */
  settings?: Record<string, unknown>;
};

/**
 * An Express server that provides middleware composition and injection
 */
export class ExpressServer extends BaseMiddlewareRegistry implements Server {
  /**
   * Base path to mount middleware
   */
  readonly basePath: string;
  /**
   * Embedded Express application
   */
  readonly expressApp: express.Application;

  /**
   * HTTP/HTTPS server
   */
  protected httpServer: HttpServer;
  constructor(
    @inject(CoreBindings.APPLICATION_CONFIG.deepProperty('express'))
    protected readonly config?: ExpressServerConfig,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    parent?: Context,
  ) {
    super(parent);
    this.scope = BindingScope.SERVER;
    let basePath = config?.basePath ?? '';
    // Trim leading and trailing `/`
    basePath = basePath.replace(/(^\/)|(\/$)/, '');
    if (basePath) basePath = '/' + basePath;
    this.basePath = basePath;

    this.expressApp = express();
    if (config?.settings) {
      for (const p in config?.settings) {
        this.expressApp.set(p, config?.settings[p]);
      }
    }
    this.httpServer = new HttpServer(this.expressApp, config);

    // Set up the middleware chain as the 1st Express middleware
    this.expressApp.use(this.basePath, toExpressMiddleware(this));
  }

  /**
   * Some of the methods below are copied from RestServer
   * TODO(rfeng): We might want to refactor some methods from RestServer into
   * the base ExpressServer.
   */
  get listening(): boolean {
    return this.httpServer ? this.httpServer.listening : false;
  }

  /**
   * The base url for the server, including the basePath if set. For example,
   * the value will be 'http://localhost:3000/api' if `basePath` is set to
   * '/api'.
   */
  get url(): string | undefined {
    let serverUrl = this.rootUrl;
    if (!serverUrl) return serverUrl;
    serverUrl = serverUrl + this.basePath;
    return serverUrl;
  }

  /**
   * The root url for the server without the basePath. For example, the value
   * will be 'http://localhost:3000' regardless of the `basePath`.
   */
  get rootUrl(): string | undefined {
    return this.httpServer?.url;
  }

  async start() {
    await this.httpServer.start();
    debug('ExpressServer listening at %s', this.httpServer.url);
  }

  stop() {
    return this.httpServer.stop();
  }

  /**
   * Retrieve the middleware context from the request
   * @param request - Request object
   */
  getMiddlewareContext(request: Request): MiddlewareContext | undefined {
    return getMiddlewareContext(request);
  }
}
