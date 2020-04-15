// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  BindingKey,
  BindingScope,
  config,
  Constructor,
  Context,
  ContextTags,
  createBindingFromClass,
  GenericInterceptor,
  Interceptor,
  InvocationContext,
  Provider,
} from '@loopback/core';
import assert from 'assert';
import debugFactory from 'debug';
import onFinished from 'on-finished';
import {promisify} from 'util';
import {MiddlewareBindings} from './keys';
import {
  ExpressMiddlewareFactory,
  ExpressRequestHandler,
  MiddlewareContext,
  MiddlewareInterceptorBindingOptions,
  Request,
  Response,
} from './types';

const debug = debugFactory('loopback:middleware');

const onFinishedAsync = promisify(onFinished);

/**
 * Execute an Express-style callback-based request handler.
 *
 * @param handler - Express middleware handler function
 * @param request
 * @param response
 * @returns A promise resolved to:
 * - `true` when the request was handled
 * - `false` when the handler called `next()` to proceed to the next
 *    handler (middleware) in the chain.
 */
export function executeExpressRequestHandler(
  handler: ExpressRequestHandler,
  request: Request,
  response: Response,
): Promise<boolean> {
  const responseWritten = onFinishedAsync(response).then(() => true);
  const handlerFinished = new Promise<boolean>((resolve, reject) => {
    handler(request, response, err => {
      if (err) {
        reject(err);
      } else {
        // Express router called next, which means no route was matched
        debug('[%s] Handler calling next()', handler.name, err);
        resolve(false);
      }
    });
  });
  /**
   * Express middleware may handle the response by itself and not call
   * `next`. We use `Promise.race()` to determine if we need to proceed
   * with next interceptor in the chain or just return.
   */
  return Promise.race([handlerFinished, responseWritten]);
}

/**
 * Wrap an express middleware handler function as an interceptor
 * @param handlerFn - Express middleware handler function
 *
 * @typeParam CTX - Context type
 */
export function toInterceptor<CTX extends Context = InvocationContext>(
  handlerFn: ExpressRequestHandler,
): GenericInterceptor<CTX> {
  return async (context, next) => {
    const middlewareCtx = await context.get<MiddlewareContext>(
      MiddlewareBindings.CONTEXT,
    );
    const finished = await executeExpressRequestHandler(
      handlerFn,
      middlewareCtx.request,
      middlewareCtx.response,
    );
    if (!finished) {
      debug('[%s] Proceed with downstream interceptors', handlerFn.name);
      const val = await next();
      debug(
        '[%s] Result received from downstream interceptors',
        handlerFn.name,
      );
      return val;
    }
    // Return response to indicate the response has been produced
    return middlewareCtx.response;
  };
}

/**
 * Create an interceptor function from express middleware.
 * @param middlewareFactory - Express middleware factory function. A wrapper
 * can be created if the Express middleware module does not conform to the
 * factory pattern and signature.
 * @param middlewareConfig - Configuration for the Express middleware
 *
 * @typeParam CFG - Configuration type
 * @typeParam CTX - Context type
 */
export function createInterceptor<CFG, CTX extends Context = InvocationContext>(
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  middlewareConfig?: CFG,
): GenericInterceptor<CTX> {
  const handlerFn = middlewareFactory(middlewareConfig);
  return toInterceptor(handlerFn);
}

/**
 * Base class for MiddlewareInterceptor provider classes
 *
 * @example
 * ```
 * class SpyInterceptorProvider extends ExpressMiddlewareInterceptorProvider<
 *   SpyConfig
 *   > {
 *     constructor(@config() spyConfig?: SpyConfig) {
 *       super(spy, spyConfig);
 *     }
 * }
 * ```
 *
 * @typeParam CFG - Configuration type
 */
export abstract class ExpressMiddlewareInterceptorProvider<CFG>
  implements Provider<Interceptor> {
  constructor(
    protected middlewareFactory: ExpressMiddlewareFactory<CFG>,
    protected middlewareConfig?: CFG,
  ) {}

  value() {
    return createInterceptor(this.middlewareFactory, this.middlewareConfig);
  }
}

/**
 * Define a provider class that wraps the middleware as an interceptor
 * @param middlewareFactory - Express middleware factory function
 * @param defaultMiddlewareConfig - Default middleware config
 * @param className - Class name for the generated provider class
 *
 * @typeParam CFG - Configuration type
 * @typeParam CTX - Context type
 */
export function defineInterceptorProvider<
  CFG,
  CTX extends Context = InvocationContext
>(
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  defaultMiddlewareConfig?: CFG,
  className?: string,
): Constructor<Provider<GenericInterceptor<CTX>>> {
  className = buildName(middlewareFactory, className);
  assert(className, 'className is missing and it cannot be inferred.');

  const defineNamedClass = new Function(
    'middlewareFactory',
    'defaultMiddlewareConfig',
    'MiddlewareInterceptorProvider',
    'createInterceptor',
    `return class ${className} extends MiddlewareInterceptorProvider {
       constructor(middlewareConfig) {
         super(
           middlewareFactory,
           middlewareConfig != null ? middlewareConfig: defaultMiddlewareConfig,
         );
       }
       value() {
         return createInterceptor(this.middlewareFactory, this.middlewareConfig);
       }
     };`,
  );

  const cls = defineNamedClass(
    middlewareFactory,
    defaultMiddlewareConfig,
    ExpressMiddlewareInterceptorProvider,
    createInterceptor,
  );
  config()(cls, '', 0);
  return cls;
}

/**
 * Build a name for the middleware
 * @param middlewareFactory - Express middleware factory function
 * @param providedName - Provided name
 * @param suffix - Suffix
 */
export function buildName<CFG>(
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  providedName?: string,
  suffix?: string,
) {
  if (!providedName) {
    let name = middlewareFactory.name;
    name = name.replace(/[^\w]/g, '_');
    if (name) {
      providedName = `${name}${suffix ?? ''}`;
    }
  }
  return providedName;
}

/**
 * Bind a middleware interceptor to the given context
 *
 * @param ctx - Context object
 * @param middlewareFactory - Express middleware factory function
 * @param middlewareConfig - Express middleware config
 * @param options - Options for registration
 *
 * @typeParam CFG - Configuration type
 */
export function registerExpressMiddlewareInterceptor<CFG>(
  ctx: Context,
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  middlewareConfig?: CFG,
  options: MiddlewareInterceptorBindingOptions = {},
) {
  options = {
    injectConfiguration: true,
    global: true,
    group: 'middleware',
    ...options,
  };
  if (!options.injectConfiguration) {
    let key = options.key;
    if (!key) {
      const name = buildName(middlewareFactory);
      key = name
        ? `interceptors.middleware.${name}`
        : BindingKey.generate('interceptors.middleware');
    }
    const binding = ctx
      .bind(key!)
      .to(createInterceptor(middlewareFactory, middlewareConfig));
    if (options.global) {
      binding.tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: 'route'});
      binding.apply(asGlobalInterceptor(options.group));
    }
    return binding;
  }
  const providerClass = defineInterceptorProvider(
    middlewareFactory,
    middlewareConfig,
    options.providerClassName,
  );
  const binding = createMiddlewareInterceptorBinding<CFG>(
    providerClass,
    options,
  );
  ctx.add(binding);
  return binding;
}

/**
 * Create a binding for the middleware based interceptor
 *
 * @param middlewareProviderClass - Middleware provider class
 * @param options - Options to create middlewareFactory interceptor binding
 *
 * @typeParam CFG - Configuration type
 */
export function createMiddlewareInterceptorBinding<CFG>(
  middlewareProviderClass: Constructor<Provider<Interceptor>>,
  options: MiddlewareInterceptorBindingOptions = {},
) {
  options = {
    global: true,
    group: 'middleware',
    ...options,
  };
  const binding = createBindingFromClass(middlewareProviderClass, {
    defaultScope: BindingScope.TRANSIENT,
    namespace: 'interceptors',
  });
  if (options.global) {
    binding.tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: 'route'});
    binding.apply(asGlobalInterceptor(options.group));
  }
  return binding;
}
