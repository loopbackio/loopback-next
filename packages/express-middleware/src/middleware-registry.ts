// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/express-middleware
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  compareBindingsByTag,
  config,
  Constructor,
  Context,
  ContextView,
  createBindingFromClass,
  inject,
  Provider,
} from '@loopback/context';
import * as express from 'express';
import {Router} from 'express';
import {ExpressBindings} from './keys';
import {asMiddlewareBinding, middlewareFilter} from './middleware';
import {
  ExpressRequestMethod,
  MiddlewareErrorHandler,
  MiddlewareHandler,
  MiddlewareRegistryOptions,
  MiddlewareRequestHandler,
  MiddlewareSpec,
} from './types';
import debugFactory = require('debug');
const debug = debugFactory('loopback:express:middleware');

interface UpdateRouter {
  (router: Router): void;
}

/**
 * A context-based registry for express middleware
 */
export class MiddlewareRegistry {
  public static readonly ERROR_PHASE = '$error';
  public static readonly FINAL_PHASE = '$final';

  private _routerUpdates: UpdateRouter[] | undefined;
  private _middlewareNameKey = 1;
  private _router?: express.Router;

  public readonly requestHandler: express.RequestHandler;
  private middlewareView: ContextView<MiddlewareHandler>;

  constructor(
    @inject.context() private context: Context,
    @config()
    protected options: MiddlewareRegistryOptions = {
      parallel: false,
      phasesByOrder: [],
    },
  ) {
    this.middlewareView = this.context.createView(middlewareFilter, (a, b) =>
      compareBindingsByTag('phase', this.getPhasesByOrder())(a, b),
    );
    this.requestHandler = async (req, res, next) => {
      if (!this._router) {
        this._router = express.Router();
        await this.mountMiddleware(this._router);
      }
      return this._router(req, res, next);
    };
    this.middlewareView.on('refresh', () => {
      this._router = undefined;
      this._routerUpdates = undefined;
    });
  }

  setPhasesByOrder(phases: string[]) {
    this.options.phasesByOrder = phases || [];
  }

  /**
   * Build a list of phase names for the order. Two special phases are added
   * to the end of the list
   */
  private getPhasesByOrder() {
    const phasesByOrder = this.options.phasesByOrder.filter(
      p =>
        p !== MiddlewareRegistry.ERROR_PHASE &&
        p !== MiddlewareRegistry.FINAL_PHASE,
    );
    phasesByOrder.push(
      MiddlewareRegistry.ERROR_PHASE,
      MiddlewareRegistry.FINAL_PHASE,
    );
    return phasesByOrder;
  }

  /**
   * Mount middleware to the express router
   *
   * @param expressRouter An express router. If not provided, a new one
   * will be created.
   */
  async mountMiddleware(expressRouter = express.Router()): Promise<Router> {
    const tasks: UpdateRouter[] = await this.buildRouterUpdatesIfNeeded();
    for (const updateFn of tasks) {
      updateFn(expressRouter);
    }
    return expressRouter;
  }

  /**
   * Create an array of functions that add middleware to an express router
   */
  private async buildRouterUpdatesIfNeeded() {
    if (this._routerUpdates) return this._routerUpdates;
    const middleware = await this.middlewareView.values();
    const bindings = this.middlewareView.bindings;

    this._routerUpdates = [];
    for (const binding of bindings) {
      const index = bindings.indexOf(binding);
      const handler = middleware[index];
      const path = binding.tagMap.path;
      if (path) {
        // Add the middleware to the given path
        debug(
          'Adding middleware (binding: %s): %j',
          binding.key,
          binding.tagMap,
        );
        if (binding.tagMap.method) {
          // For regular express routes, such as `all`, `get`, or `post`
          // It corresponds to `app.get('/hello', ...);`
          const method = binding.tagMap.method as ExpressRequestMethod;
          this._routerUpdates.push(router => router[method](path, handler));
        } else {
          // For middleware, such as `app.use('/api', ...);`
          // The handler function can be an error handler too
          this._routerUpdates.push(router => router.use(path, handler));
        }
      } else {
        // Add the middleware without a path
        if (debug.enabled) {
          debug(
            'Adding middleware (binding: %s): %j',
            binding.key,
            binding.tagMap || {},
          );
        }
        this._routerUpdates.push(router => router.use(handler));
      }
    }
    return this._routerUpdates;
  }

  setMiddlewareRegistryOptions(options: MiddlewareRegistryOptions) {
    this.context
      .configure(ExpressBindings.EXPRESS_MIDDLEWARE_REGISTRY)
      .to(options);
    this._router = undefined;
    this._routerUpdates = undefined;
  }

  /**
   * Register a middleware handler function
   * @param handler
   * @param spec
   */
  middleware(handler: MiddlewareRequestHandler, spec: MiddlewareSpec = {}) {
    this.validateSpec(spec);
    const name = spec.name || `_${this._middlewareNameKey++}`;
    this.context
      .bind(`middleware.${name}`)
      .to(handler)
      .apply(asMiddlewareBinding(spec));
  }

  private validateSpec(spec: MiddlewareSpec = {}) {
    if (spec.method && !spec.path) {
      throw new Error(`Route spec for ${spec.method} must have a path.`);
    }
  }

  /**
   * Register an middleware error handler function
   * @param errHandler Error handler
   * @param spec
   */
  errorMiddleware(
    errHandler: MiddlewareErrorHandler,
    spec: MiddlewareSpec = {},
  ) {
    spec = Object.assign(spec, {phase: MiddlewareRegistry.ERROR_PHASE});
    const name = spec.name || `_${this._middlewareNameKey++}`;
    this.context
      .bind(`middleware.${name}`)
      .to(errHandler)
      .apply(asMiddlewareBinding(spec));
  }

  /**
   * Register a middleware provider class
   * @param providerClass
   * @param spec
   */
  middlewareProvider(
    providerClass: Constructor<Provider<MiddlewareRequestHandler>>,
    spec: MiddlewareSpec = {},
  ) {
    const binding = createBindingFromClass(providerClass, {
      namespace: 'middleware',
      name: spec.name,
    }).apply(asMiddlewareBinding(spec));
    this.validateSpec(binding.tagMap);
    this.context.add(binding);
  }
}
