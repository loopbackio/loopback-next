// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingAddress,
  BindingScope,
  Context,
  GenericInterceptor,
  GenericInterceptorChain,
  GenericInterceptorOrKey,
  InvocationContext,
  Next,
  ValueOrPromise,
} from '@loopback/core';
import {Request, RequestHandler, Response} from 'express';
import onFinished from 'on-finished';
import {MiddlewareBindings} from './keys';

export {Request, Response, Router, RouterOptions} from 'express';

/**
 * An object holding HTTP request, response and other data
 * needed to handle an incoming HTTP request.
 */
export interface HandlerContext {
  readonly request: Request;
  readonly response: Response;
}

/**
 * Type alias for Express RequestHandler
 */
export type ExpressRequestHandler = RequestHandler;

/**
 * A per-request Context for middleware to combine an IoC container with handler
 * context (request, response, etc.).
 */
export class MiddlewareContext extends Context implements HandlerContext {
  /**
   * A flag to tell if the response is finished.
   */
  responseFinished = false;

  /**
   * Constructor for `MiddlewareContext`
   * @param request - Express request object
   * @param response - Express response object
   * @param parent - Parent context
   * @param name - Name of the middleware context
   */
  constructor(
    public readonly request: Request,
    public readonly response: Response,
    parent?: Context,
    name?: string,
  ) {
    super(parent, name);
    this.scope = BindingScope.REQUEST;

    // Set the request context as a property of Express request object so that
    // downstream Express native integration can access `RequestContext`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request as any)[MIDDLEWARE_CONTEXT] = this;

    this.setupBindings();
    onFinished(this.response, () => {
      this.responseFinished = true;
      // Close the request context when the http response is finished so that
      // it can be recycled by GC
      this.emit('close');
      this.close();
    });
  }

  protected setupBindings() {
    this.bind(MiddlewareBindings.CONTEXT).to(this).lock();
  }
}

/**
 * A helper function to retrieve the MiddlewareContext/RequestContext from the
 * request object
 * @param request - Express request object
 */
export function getMiddlewareContext<
  T extends MiddlewareContext = MiddlewareContext,
>(request?: Request): T | undefined {
  if (request == null) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (request as any)[MIDDLEWARE_CONTEXT];
}

/**
 * Interface LoopBack 4 middleware to be executed within sequence of actions.
 * A middleware for LoopBack is basically a generic interceptor that uses
 * `MiddlewareContext`.
 *
 * @remarks
 *
 * The middleware function is responsible for processing HTTP requests and
 * responses. It typically includes the following logic.
 *
 * 1. Process the request with one of the following outcome
 *   - Reject the request by throwing an error if request is invalid, such as
 *     validation or authentication failures
 *   - Produce a response by itself, such as from the cache
 *   - Proceed by calling `await next()` to invoke downstream middleware. When
 *     `await next()` returns, it goes to step 2. If an error thrown from
 *     `await next()`, step 3 handles the error.
 *
 * 2. Process the response with one the following outcome
 *   - Reject the response by throwing an error
 *   - Replace the response with its own value
 *   - Return the response to upstream middleware
 *
 * 3. Catch the error thrown from `await next()`. If the `catch` block does not
 * exist, the error will be bubbled up to upstream middleware
 *
 * The signature of a middleware function is described at
 * {@link https://loopback.io/doc/en/lb4/apidocs.express.middleware.html | Middleware}.
 * It's very much the same as
 * {@link https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware | Koa middleware}.
 *
 * @example
 * ```ts
 * const log: Middleware = async (requestCtx, next) => {
 *   const {request} = requestCtx;
 *   console.log('Request: %s %s', request.method, request.originalUrl);
 *   try {
 *     // Proceed with next middleware
 *     await next();
 *     console.log('Response received for %s %s', request.method, request.originalUrl);
 *   } catch(err) {
 *     console.error('Error received for %s %s', request.method, request.originalUrl);
 *     throw err;
 *   }
 * }
 * ```
 */
export interface Middleware extends GenericInterceptor<MiddlewareContext> {}

/**
 * An interceptor chain of middleware. This represents a list of cascading
 * middleware functions to be executed by the order of `group` names.
 */
export class MiddlewareChain extends GenericInterceptorChain<MiddlewareContext> {}

/**
 * A middleware function or binding key
 */
export type MiddlewareOrKey = GenericInterceptorOrKey<MiddlewareContext>;

/**
 * Default extension point name for middleware
 */
export const DEFAULT_MIDDLEWARE_CHAIN = 'middlewareChain.default';

/**
 * Options for `InvokeMiddleware`
 */
export interface InvokeMiddlewareOptions {
  /**
   * Name of the extension point. Default to the `extensionPoint` tag value
   * from the binding
   */
  chain?: string;

  /**
   * An array of group names to denote the order of execution, such as
   * `['cors', 'caching', 'rate-limiting']`.
   */
  orderedGroups?: string[];

  /**
   * An optional function to validate the sorted groups before invoking the
   * middleware chain
   */
  validate?: (groups: string[]) => void;

  /**
   * Pre-built middleware list. If set, the list will be used to create the
   * middleware chain without discovering again within the context.
   */
  middlewareList?: MiddlewareOrKey[];

  /**
   * Optional next handler
   */
  next?: Next;
}

/**
 * Interface for the invoker of middleware registered under the an extension
 * point name.
 */
export interface InvokeMiddleware {
  /**
   * Invoke the request interceptors in the chain.
   * @param middlewareCtx - Middleware Context
   * @param options - Options for the invocation
   */
  (
    middlewareCtx: MiddlewareContext,
    options?: InvokeMiddlewareOptions,
  ): ValueOrPromise<boolean>;

  /**
   * Invoke a list of Express middleware handler functions
   *
   * @example
   * ```ts
   * import cors from 'cors';
   * import helmet from 'helmet';
   * import morgan from 'morgan';
   *
   *
   * const finished = await this.invokeMiddleware(
   *   middlewareCtx, [
   *     cors(),
   *     helmet(),
   *     morgan('combined'),
   * ]);
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
  (
    middlewareCtx: MiddlewareContext,
    handlers: ExpressRequestHandler[],
  ): ValueOrPromise<boolean>;
}

/**
 * Options for defining a middleware
 */
export interface MiddlewareCreationOptions {
  /**
   * A flag to control if configuration for the middleware can be injected
   * lazily.
   *
   * - `true` (default): creates a provider class with `@config`
   * - `false`: No configuration injection is supported
   * - 'watch': creates a provider class with `@config.view`
   */
  injectConfiguration?: boolean | 'watch';
  /**
   * Class name for the created provider class. It's only used if
   * `injectConfiguration` is not set to `false`.
   */
  providerClassName?: string;
}

/**
 * Options to create a middleware binding for the sequence action or interceptor.
 * @typeParam CTX - Context class
 */
export interface BaseMiddlewareBindingOptions<CTX extends Context>
  extends MiddlewareCreationOptions {
  /**
   * Binding key for the middleware.
   */
  key?: BindingAddress<GenericInterceptor<CTX>>;
  /**
   * An optional `group` name to be used for order of executions
   */
  group?: string;
}

/**
 * Options to bind a middleware as an interceptor to the context
 */
export interface MiddlewareInterceptorBindingOptions
  extends BaseMiddlewareBindingOptions<InvocationContext> {
  /**
   * A flag to control if the interceptor should be global. Default to `true`.
   */
  global?: boolean;
}

/**
 * Options to bind middleware as a request context based interceptor within an
 * `InvokeMiddleware` action of the sequence.
 */
export interface MiddlewareBindingOptions
  extends BaseMiddlewareBindingOptions<MiddlewareContext> {
  /**
   * Name of the middleware extension point. Default to `DEFAULT_MIDDLEWARE_CHAIN`.
   */
  chain?: string;

  /**
   * An array of group names for upstream middleware in the cascading order.
   *
   * For example, the  `invokeMethod` depends on `parseParams` for request
   * processing. The `upstreamGroups` for `invokeMethod` should be
   * `['parseParams']`. The order of groups in the array does not matter.
   */
  upstreamGroups?: string | string[];

  /**
   * An array of group names for downstream middleware in the cascading order.
   *
   * For example, the  `sendResponse` depends on `invokeMethod` for response
   * processing. The `downstreamGroups` for `sendResponse` should be
   * `['invokeMethod']`. The order of groups in the array does not matter.
   */
  downstreamGroups?: string | string[];
}

/**
 * Interface for an express middleware factory
 * @typeParam C - Configuration type
 */
export interface ExpressMiddlewareFactory<C> {
  (middlewareConfig?: C): ExpressRequestHandler;
}

/**
 * A symbol to store `MiddlewareContext` on the request object.  This symbol
 * can be referenced by name, before it is created.
 */
export const MIDDLEWARE_CONTEXT = Symbol.for('loopback.middleware.context');

/**
 * Constants for middleware groups
 */
export namespace MiddlewareGroups {
  /**
   * Enforce CORS
   */
  export const CORS = 'cors';

  /**
   * Server OpenAPI specs
   */
  export const API_SPEC = 'apiSpec';

  /**
   * Default middleware group
   */
  export const MIDDLEWARE = 'middleware';
  export const DEFAULT = MIDDLEWARE;
}
