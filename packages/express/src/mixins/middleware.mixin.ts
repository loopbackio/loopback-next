// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingAddress,
  Constructor,
  Context,
  isBindingAddress,
  MixinTarget,
  Provider,
} from '@loopback/core';
import {
  registerExpressMiddleware,
  registerMiddleware,
  toMiddleware,
} from '../middleware';
import {MiddlewareRegistry} from '../middleware-registry';
import {
  ExpressMiddlewareFactory,
  ExpressRequestHandler,
  Middleware,
  MiddlewareBindingOptions,
} from '../types';

function extendsFrom(
  subClass: Constructor<unknown>,
  baseClass: Constructor<unknown>,
) {
  let cls = subClass;
  while (cls) {
    if (cls === baseClass) return true;
    cls = Object.getPrototypeOf(cls);
  }
  return false;
}

export function MiddlewareMixin<T extends MixinTarget<Context>>(superClass: T) {
  if (!extendsFrom(superClass, Context)) {
    throw new TypeError('The super class does not extend from Context');
  }
  return class extends superClass implements MiddlewareRegistry {
    /**
     * Bind an Express middleware to this server context
     *
     * @example
     * ```ts
     * import myExpressMiddlewareFactory from 'my-express-middleware';
     * const myExpressMiddlewareConfig= {};
     * const myExpressMiddleware = myExpressMiddlewareFactory(myExpressMiddlewareConfig);
     * server.expressMiddleware('middleware.express.my', myExpressMiddleware);
     * // Or
     * server.expressMiddleware('middleware.express.my', [myExpressMiddleware]);
     * ```
     * @param key - Middleware binding key
     * @param middleware - Express middleware handler function(s)
     *
     */
    expressMiddleware(
      key: BindingAddress,
      middleware: ExpressRequestHandler | ExpressRequestHandler[],
      options?: MiddlewareBindingOptions,
    ): Binding<Middleware>;

    /**
     * Bind an Express middleware to this server context
     *
     * @example
     * ```ts
     * import myExpressMiddlewareFactory from 'my-express-middleware';
     * const myExpressMiddlewareConfig= {};
     * server.expressMiddleware(myExpressMiddlewareFactory, myExpressMiddlewareConfig);
     * ```
     * @param middlewareFactory - Middleware module name or factory function
     * @param middlewareConfig - Middleware config
     * @param options - Options for registration
     *
     * @typeParam CFG - Configuration type
     */
    expressMiddleware<CFG>(
      middlewareFactory: ExpressMiddlewareFactory<CFG>,
      middlewareConfig?: CFG,
      options?: MiddlewareBindingOptions,
    ): Binding<Middleware>;

    /**
     * @internal
     *
     * This signature is only used by RestApplication for delegation
     */
    expressMiddleware<CFG>(
      factoryOrKey: ExpressMiddlewareFactory<CFG> | BindingAddress<Middleware>,
      configOrHandler: CFG | ExpressRequestHandler | ExpressRequestHandler[],
      options?: MiddlewareBindingOptions,
    ): Binding<Middleware>;

    /**
     * @internal
     * Implementation of `expressMiddleware`
     */
    expressMiddleware<CFG>(
      factoryOrKey: ExpressMiddlewareFactory<CFG> | BindingAddress<Middleware>,
      configOrHandlers: CFG | ExpressRequestHandler | ExpressRequestHandler[],
      options: MiddlewareBindingOptions = {},
    ): Binding<Middleware> {
      const key = factoryOrKey as BindingAddress<Middleware>;
      if (isBindingAddress(key)) {
        const handlers = Array.isArray(configOrHandlers)
          ? configOrHandlers
          : [configOrHandlers as ExpressRequestHandler];
        // Create middleware that wraps all Express handlers
        if (handlers.length === 0) {
          throw new Error(
            'No Express middleware handler function is provided.',
          );
        }
        return registerMiddleware(
          this as unknown as Context,
          toMiddleware(handlers[0], ...handlers.slice(1)),
          {
            ...options,
            key,
          },
        );
      } else {
        return registerExpressMiddleware(
          this as unknown as Context,
          factoryOrKey as ExpressMiddlewareFactory<CFG>,
          configOrHandlers as CFG,
          options,
        );
      }
    }

    /**
     * Register a middleware function or provider class
     *
     * @example
     * ```ts
     * const log: Middleware = async (requestCtx, next) {
     *   // ...
     * }
     * server.middleware(log);
     * ```
     *
     * @param middleware - Middleware function or provider class
     * @param options - Middleware binding options
     */
    middleware(
      middleware: Middleware | Constructor<Provider<Middleware>>,
      options: MiddlewareBindingOptions = {},
    ): Binding<Middleware> {
      return registerMiddleware(
        this as unknown as Context,
        middleware,
        options,
      );
    }
  };
}
