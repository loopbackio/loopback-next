// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asGlobalInterceptor,
  Binding,
  BindingKey,
  BindingScope,
  config,
  Constructor,
  Context,
  ContextTags,
  ContextView,
  createBindingFromClass,
  GenericInterceptor,
  GenericInterceptorChain,
  inject,
  Interceptor,
  InvocationContext,
  NamespacedReflect,
  Provider,
} from '@loopback/core';
import assert from 'assert';
import debugFactory from 'debug';
import onFinished from 'on-finished';
import {promisify} from 'util';
import {
  DEFAULT_MIDDLEWARE_GROUP,
  GLOBAL_MIDDLEWARE_INTERCEPTOR_NAMESPACE,
  MiddlewareBindings,
  MIDDLEWARE_INTERCEPTOR_NAMESPACE,
} from './keys';
import {
  ExpressMiddlewareFactory,
  ExpressRequestHandler,
  MiddlewareContext,
  MiddlewareCreationOptions,
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
    handler(request, response, (err: unknown) => {
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
 *
 * @example
 * ```ts
 * toInterceptor(fn);
 * toInterceptor(fn1, fn2, fn3);
 * ```
 * @param firstHandler - An Express middleware handler
 * @param additionalHandlers - A list of Express middleware handler function
 *
 * @typeParam CTX - Context type
 */
export function toInterceptor<CTX extends Context = InvocationContext>(
  firstHandler: ExpressRequestHandler,
  ...additionalHandlers: ExpressRequestHandler[]
): GenericInterceptor<CTX> {
  if (additionalHandlers.length === 0) {
    const handlerFn = firstHandler;
    return toInterceptorFromExpressMiddleware<CTX>(handlerFn);
  }
  const handlers = [firstHandler, ...additionalHandlers];
  const interceptorList = handlers.map(handler => toInterceptor<CTX>(handler));
  return async (invocationCtx, next) => {
    const middlewareChain = new GenericInterceptorChain(
      invocationCtx,
      interceptorList,
    );
    return middlewareChain.invokeInterceptors(next);
  };
}

function toInterceptorFromExpressMiddleware<
  CTX extends Context = InvocationContext,
>(handlerFn: ExpressRequestHandler): GenericInterceptor<CTX> {
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
 *
 * To inject the configuration without automatic reloading:
 *
 * ```ts
 * class SpyInterceptorProvider extends ExpressMiddlewareInterceptorProvider<
 *   SpyConfig
 *   > {
 *     constructor(@config() spyConfig?: SpyConfig) {
 *       super(spy, spyConfig);
 *     }
 * }
 * ```
 *
 * To inject the configuration without automatic reloading:
 * ```ts
 * class SpyInterceptorProvider extends ExpressMiddlewareInterceptorProvider<
 *   SpyConfig
 * > {
 *   constructor(@config.view() configView?: ContextView<SpyConfig>) {
 *     super(spy, configView);
 *   }
 * }
 * ```
 *
 * @typeParam CFG - Configuration type
 */
export abstract class ExpressMiddlewareInterceptorProvider<
  CFG,
  CTX extends Context = InvocationContext,
> implements Provider<GenericInterceptor<CTX>>
{
  protected middlewareConfigView?: ContextView<CFG>;
  protected middlewareConfig?: CFG;

  constructor(
    protected middlewareFactory: ExpressMiddlewareFactory<CFG>,
    middlewareConfig?: CFG | ContextView<CFG>,
  ) {
    if (middlewareConfig != null && middlewareConfig instanceof ContextView) {
      this.middlewareConfigView = middlewareConfig;
    } else {
      this.middlewareConfig = middlewareConfig;
    }
    this.setupConfigView();
  }

  // Inject current binding for debugging
  @inject.binding()
  private binding?: Binding<GenericInterceptor<CTX>>;

  /**
   * Cached interceptor instance. It has three states:
   *
   * - undefined: Not initialized
   * - null: To be recreated as the configuration is changed
   * - function: The interceptor function created from the latest configuration
   */
  private interceptor?: GenericInterceptor<CTX> | null;

  private setupConfigView() {
    if (this.middlewareConfigView) {
      // Set up a listener to reset the cached interceptor function for the
      // first time
      this.middlewareConfigView.on('refresh', () => {
        if (this.binding != null) {
          debug(
            'Configuration change is detected for binding %s.' +
              ' The Express middleware handler function will be recreated.',
            this.binding.key,
          );
        }
        this.interceptor = null;
      });
    }
  }

  value(): GenericInterceptor<CTX> {
    return async (ctx, next) => {
      // Get the latest configuration
      if (this.middlewareConfigView != null) {
        this.middlewareConfig =
          (await this.middlewareConfigView.singleValue()) ??
          this.middlewareConfig;
      }

      if (this.interceptor == null) {
        // Create a new interceptor for the first time or recreate it if it
        // was reset to `null` when its configuration changed
        debug(
          'Creating interceptor for %s with config',
          this.middlewareFactory.name,
          this.middlewareConfig,
        );
        this.interceptor = createInterceptor(
          this.middlewareFactory,
          this.middlewareConfig,
        );
      }
      return this.interceptor(ctx, next);
    };
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
  CTX extends Context = InvocationContext,
>(
  middlewareFactory: ExpressMiddlewareFactory<CFG>,
  defaultMiddlewareConfig?: CFG,
  options?: MiddlewareCreationOptions,
): Constructor<Provider<GenericInterceptor<CTX>>> {
  let className = options?.providerClassName;
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
           middlewareConfig,
         );
         if (this.middlewareConfig == null) {
           this.middlewareConfig = defaultMiddlewareConfig;
         }
       }
     };`,
  );

  const cls = defineNamedClass(
    middlewareFactory,
    defaultMiddlewareConfig,
    ExpressMiddlewareInterceptorProvider,
    createInterceptor,
  );
  if (options?.injectConfiguration === 'watch') {
    // Inject the config view
    config.view()(cls, '', 0);
    new NamespacedReflect().metadata('design:paramtypes', [ContextView])(cls);
  } else {
    // Inject the config
    config()(cls, '', 0);
  }
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
    group: DEFAULT_MIDDLEWARE_GROUP,
    ...options,
  };
  if (!options.injectConfiguration) {
    let key = options.key;
    if (!key) {
      const name = buildName(middlewareFactory);
      const namespace = options.global
        ? GLOBAL_MIDDLEWARE_INTERCEPTOR_NAMESPACE
        : MIDDLEWARE_INTERCEPTOR_NAMESPACE;
      key = name ? `${namespace}.${name}` : BindingKey.generate(namespace);
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
    options,
  );
  const binding = createMiddlewareInterceptorBinding(providerClass, options);
  ctx.add(binding);
  return binding;
}

/**
 * Create a binding for the middleware based interceptor
 *
 * @param middlewareProviderClass - Middleware provider class
 * @param options - Options to create middlewareFactory interceptor binding
 *
 */
export function createMiddlewareInterceptorBinding(
  middlewareProviderClass: Constructor<Provider<Interceptor>>,
  options: MiddlewareInterceptorBindingOptions = {},
) {
  options = {
    global: true,
    group: DEFAULT_MIDDLEWARE_GROUP,
    ...options,
  };
  const namespace = options.global
    ? GLOBAL_MIDDLEWARE_INTERCEPTOR_NAMESPACE
    : MIDDLEWARE_INTERCEPTOR_NAMESPACE;
  const binding = createBindingFromClass(middlewareProviderClass, {
    defaultScope: BindingScope.SINGLETON,
    namespace,
  });
  if (options.global) {
    binding.tag({[ContextTags.GLOBAL_INTERCEPTOR_SOURCE]: 'route'});
    binding.apply(asGlobalInterceptor(options.group));
  }
  return binding;
}
