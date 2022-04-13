// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingKey,
  BindingScope,
  BindingTemplate,
  compareBindingsByTag,
  Constructor,
  Context,
  ContextView,
  createBindingFromClass,
  extensionFilter,
  extensionFor,
  InvocationResult,
  isProviderClass,
  Provider,
  transformValueOrPromise,
  ValueOrPromise,
} from '@loopback/core';
import debugFactory from 'debug';
import {sortListOfGroups} from './group-sorter';
import {DEFAULT_MIDDLEWARE_GROUP, MIDDLEWARE_NAMESPACE} from './keys';
import {
  createInterceptor,
  defineInterceptorProvider,
  toInterceptor,
} from './middleware-interceptor';
import {
  DEFAULT_MIDDLEWARE_CHAIN,
  ExpressMiddlewareFactory,
  ExpressRequestHandler,
  InvokeMiddlewareOptions,
  Middleware,
  MiddlewareBindingOptions,
  MiddlewareChain,
  MiddlewareContext,
} from './types';

const debug = debugFactory('loopback:middleware');

/**
 * An adapter function to create a LoopBack middleware that invokes the list
 * of Express middleware handler functions in the order of their positions
 * @example
 * ```ts
 * toMiddleware(fn);
 * toMiddleware(fn1, fn2, fn3);
 * ```
 * @param firstHandler - An Express middleware handler
 * @param additionalHandlers A list of Express middleware handler functions
 * @returns A LoopBack middleware function that wraps the list of Express
 * middleware
 */
export function toMiddleware(
  firstHandler: ExpressRequestHandler,
  ...additionalHandlers: ExpressRequestHandler[]
): Middleware {
  if (additionalHandlers.length === 0) return toInterceptor(firstHandler);
  const handlers = [firstHandler, ...additionalHandlers];
  const middlewareList = handlers.map(handler =>
    toInterceptor<MiddlewareContext>(handler),
  );
  return (middlewareCtx, next) => {
    if (middlewareList.length === 1) {
      return middlewareList[0](middlewareCtx, next);
    }
    const middlewareChain = new MiddlewareChain(middlewareCtx, middlewareList);
    return middlewareChain.invokeInterceptors(next);
  };
}

/**
 * An adapter function to create a LoopBack middleware from Express middleware
 * factory function and configuration object.
 *
 * @param middlewareFactory - Express middleware factory function
 * @param middlewareConfig - Express middleware config
 *
 * @returns A LoopBack middleware function that wraps the Express middleware
 */
export function createMiddleware<CFG>(
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  middlewareConfig?: CFG,
): Middleware {
  return createInterceptor<CFG, MiddlewareContext>(
    middlewareFactory,
    middlewareConfig,
  );
}

/**
 * Bind a Express middleware to the given context
 *
 * @param ctx - Context object
 * @param middlewareFactory - Middleware module name or factory function
 * @param middlewareConfig - Middleware config
 * @param options - Options for registration
 *
 * @typeParam CFG - Configuration type
 */
export function registerExpressMiddleware<CFG>(
  ctx: Context,
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  middlewareConfig?: CFG,
  options: MiddlewareBindingOptions = {},
): Binding<Middleware> {
  options = {injectConfiguration: true, ...options};
  options.chain = options.chain ?? DEFAULT_MIDDLEWARE_CHAIN;
  if (!options.injectConfiguration) {
    const middleware = createMiddleware(middlewareFactory, middlewareConfig);
    return registerMiddleware(ctx, middleware, options);
  }

  const providerClass = defineInterceptorProvider<CFG, MiddlewareContext>(
    middlewareFactory,
    middlewareConfig,
    options,
  );
  return registerMiddleware(ctx, providerClass, options);
}

/**
 * Template function for middleware bindings
 * @param options - Options to configure the binding
 */
export function asMiddleware(
  options: MiddlewareBindingOptions = {},
): BindingTemplate {
  return function middlewareBindingTemplate(binding) {
    binding.apply(extensionFor(options.chain ?? DEFAULT_MIDDLEWARE_CHAIN));

    if (!binding.tagMap.group) {
      binding.tag({group: options.group ?? DEFAULT_MIDDLEWARE_GROUP});
    }
    const groupsBefore = options.upstreamGroups;
    if (groupsBefore != null) {
      binding.tag({
        upstreamGroups:
          typeof groupsBefore === 'string' ? [groupsBefore] : groupsBefore,
      });
    }
    const groupsAfter = options.downstreamGroups;
    if (groupsAfter != null) {
      binding.tag({
        downstreamGroups:
          typeof groupsAfter === 'string' ? [groupsAfter] : groupsAfter,
      });
    }
  };
}

/**
 * Bind the middleware function or provider class to the context
 * @param ctx - Context object
 * @param middleware - Middleware function or provider class
 * @param options - Middleware binding options
 */
export function registerMiddleware(
  ctx: Context,
  middleware: Middleware | Constructor<Provider<Middleware>>,
  options: MiddlewareBindingOptions,
) {
  if (isProviderClass(middleware as Constructor<Provider<Middleware>>)) {
    const binding = createMiddlewareBinding(
      middleware as Constructor<Provider<Middleware>>,
      options,
    );
    ctx.add(binding);
    return binding;
  }
  const key = options.key ?? BindingKey.generate(MIDDLEWARE_NAMESPACE);
  return ctx
    .bind(key)
    .to(middleware as Middleware)
    .apply(asMiddleware(options));
}

/**
 * Create a binding for the middleware provider class
 *
 * @param middlewareProviderClass - Middleware provider class
 * @param options - Options to create middleware binding
 *
 */
export function createMiddlewareBinding(
  middlewareProviderClass: Constructor<Provider<Middleware>>,
  options: MiddlewareBindingOptions = {},
) {
  options.chain = options.chain ?? DEFAULT_MIDDLEWARE_CHAIN;
  const binding = createBindingFromClass(middlewareProviderClass, {
    defaultScope: BindingScope.TRANSIENT,
    namespace: MIDDLEWARE_NAMESPACE,
    key: options.key,
  }).apply(asMiddleware(options));
  return binding;
}

/**
 * Discover and invoke registered middleware in a chain for the given extension
 * point.
 *
 * @param middlewareCtx - Middleware context
 * @param options - Options to invoke the middleware chain
 */
export function invokeMiddleware(
  middlewareCtx: MiddlewareContext,
  options?: InvokeMiddlewareOptions,
): ValueOrPromise<InvocationResult> {
  debug(
    'Invoke middleware chain for %s %s with options',
    middlewareCtx.request.method,
    middlewareCtx.request.originalUrl,
    options,
  );
  let keys = options?.middlewareList;
  if (keys == null) {
    const view = new MiddlewareView(middlewareCtx, options);
    keys = view.middlewareBindingKeys;
    view.close();
  }
  const mwChain = new MiddlewareChain(middlewareCtx, keys);
  return mwChain.invokeInterceptors(options?.next);
}

/**
 * Watch middleware binding keys for the given context and sort them by
 * group
 * @param ctx - Context object
 * @param options - Middleware options
 */
export class MiddlewareView extends ContextView {
  private options: InvokeMiddlewareOptions;
  private keys: string[];

  constructor(ctx: Context, options?: InvokeMiddlewareOptions) {
    // Find extensions for the given extension point binding
    const filter = extensionFilter(options?.chain ?? DEFAULT_MIDDLEWARE_CHAIN);
    super(ctx, filter);
    this.options = {
      chain: DEFAULT_MIDDLEWARE_CHAIN,
      orderedGroups: [],
      ...options,
    };
    this.buildMiddlewareKeys();
    this.open();
  }

  refresh() {
    super.refresh();
    this.buildMiddlewareKeys();
  }

  /**
   * A list of binding keys sorted by group for registered middleware
   */
  get middlewareBindingKeys() {
    return this.keys;
  }

  private buildMiddlewareKeys() {
    const middlewareBindings = this.bindings;
    if (debug.enabled) {
      debug(
        'Middleware for extension point "%s":',
        this.options.chain,
        middlewareBindings.map(b => b.key),
      );
    }

    // Calculate orders from middleware dependencies
    const ordersFromDependencies: string[][] = [];
    middlewareBindings.forEach(b => {
      const group: string = b.tagMap.group ?? DEFAULT_MIDDLEWARE_GROUP;
      const groupsBefore: string[] = b.tagMap.upstreamGroups ?? [];
      groupsBefore.forEach(d => ordersFromDependencies.push([d, group]));
      const groupsAfter: string[] = b.tagMap.downstreamGroups ?? [];
      groupsAfter.forEach(d => ordersFromDependencies.push([group, d]));
    });

    const order = sortListOfGroups(
      ...ordersFromDependencies,
      this.options.orderedGroups!,
    );

    /**
     * Validate sorted groups
     */
    if (typeof this.options?.validate === 'function') {
      this.options.validate(order);
    }

    this.keys = middlewareBindings
      .sort(compareBindingsByTag('group', order))
      .map(b => b.key);
  }
}

/**
 * Invoke a list of Express middleware handler functions
 *
 * @example
 * ```ts
 * import cors from 'cors';
 * import helmet from 'helmet';
 * import morgan from 'morgan';
 * import {MiddlewareContext, invokeExpressMiddleware} from '@loopback/express';
 *
 * // ... Either an instance of `MiddlewareContext` is passed in or a new one
 * // can be instantiated from Express request and response objects
 *
 * const middlewareCtx = new MiddlewareContext(request, response);
 * const finished = await invokeExpressMiddleware(
 *   middlewareCtx,
 *   cors(),
 *   helmet(),
 *   morgan('combined'));
 *
 * if (finished) {
 *   // Http response is sent by one of the middleware
 * } else {
 *   // Http response is yet to be produced
 * }
 * ```
 * @param middlewareCtx - Middleware context
 * @param handlers - A list of Express middleware handler functions
 */
export function invokeExpressMiddleware(
  middlewareCtx: MiddlewareContext,
  ...handlers: ExpressRequestHandler[]
): ValueOrPromise<boolean> {
  if (handlers.length === 0) {
    throw new Error('No Express middleware handler function is provided.');
  }
  const middleware = toMiddleware(handlers[0], ...handlers.slice(1));
  debug(
    'Invoke Express middleware for %s %s',
    middlewareCtx.request.method,
    middlewareCtx.request.originalUrl,
  );
  // Invoke the middleware with a no-op next()
  const result = middleware(middlewareCtx, () => undefined);
  // Check if the response is finished
  return transformValueOrPromise(result, val => val === middlewareCtx.response);
}

/**
 * An adapter function to create an Express middleware handler to discover and
 * invoke registered LoopBack-style middleware in the context.
 * @param ctx - Context object to discover registered middleware
 */
export function toExpressMiddleware(ctx: Context): ExpressRequestHandler {
  return (req, res, next) => {
    const middlewareCtx = new MiddlewareContext(req, res, ctx);

    new Promise((resolve, reject) => {
      // eslint-disable-next-line no-void
      void (async () => {
        try {
          const result = await invokeMiddleware(middlewareCtx);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      })();
    })
      .then(result => {
        if (result !== res) next();
      })
      .catch(next);
  };
}
