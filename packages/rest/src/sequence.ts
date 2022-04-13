// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  config,
  Context,
  inject,
  injectable,
  ValueOrPromise,
} from '@loopback/core';
import {
  InvokeMiddleware,
  InvokeMiddlewareOptions,
  MiddlewareGroups,
  MiddlewareView,
} from '@loopback/express';
import debugFactory from 'debug';
import {RestBindings, RestTags} from './keys';
import {RequestContext} from './request-context';
import {FindRoute, InvokeMethod, ParseParams, Reject, Send} from './types';
const debug = debugFactory('loopback:rest:sequence');

const SequenceActions = RestBindings.SequenceActions;

/**
 * A sequence function is a function implementing a custom
 * sequence of actions to handle an incoming request.
 */
export type SequenceFunction = (
  context: RequestContext,
  sequence: DefaultSequence,
) => ValueOrPromise<void>;

/**
 * A sequence handler is a class implementing sequence of actions
 * required to handle an incoming request.
 */
export interface SequenceHandler {
  /**
   * Handle the request by running the configured sequence of actions.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  handle(context: RequestContext): Promise<void>;
}

/**
 * The default implementation of SequenceHandler.
 *
 * @remarks
 * This class implements default Sequence for the LoopBack framework.
 * Default sequence is used if user hasn't defined their own Sequence
 * for their application.
 *
 * Sequence constructor() and run() methods are invoked from [[http-handler]]
 * when the API request comes in. User defines APIs in their Application
 * Controller class.
 *
 * @example
 * User can bind their own Sequence to app as shown below
 * ```ts
 * app.bind(CoreBindings.SEQUENCE).toClass(MySequence);
 * ```
 */
export class DefaultSequence implements SequenceHandler {
  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;

  /**
   * Constructor: Injects findRoute, invokeMethod & logError
   * methods as promises.
   *
   * @param findRoute - Finds the appropriate controller method,
   *  spec and args for invocation (injected via SequenceActions.FIND_ROUTE).
   * @param parseParams - The parameter parsing function (injected
   * via SequenceActions.PARSE_PARAMS).
   * @param invoke - Invokes the method specified by the route
   * (injected via SequenceActions.INVOKE_METHOD).
   * @param send - The action to merge the invoke result with the response
   * (injected via SequenceActions.SEND)
   * @param reject - The action to take if the invoke returns a rejected
   * promise result (injected via SequenceActions.REJECT).
   */
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Executes middleware for CORS, OpenAPI spec endpoints
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      // Invoke registered Express middleware
      const finished = await this.invokeMiddleware(context);
      if (finished) {
        // The response been produced by the middleware chain
        return;
      }
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      debug('%s result -', route.describe(), result);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}

/**
 * Built-in middleware groups for the REST sequence
 */
export namespace RestMiddlewareGroups {
  /**
   * Invoke downstream middleware to get the result or catch errors so that it
   * can produce the http response
   */
  export const SEND_RESPONSE = 'sendResponse';

  /**
   * Enforce CORS
   */
  export const CORS = MiddlewareGroups.CORS;

  /**
   * Server OpenAPI specs
   */
  export const API_SPEC = MiddlewareGroups.API_SPEC;

  /**
   * Default middleware group
   */
  export const MIDDLEWARE = MiddlewareGroups.MIDDLEWARE;
  export const DEFAULT = MIDDLEWARE;

  /**
   * Find the route that can serve the request
   */
  export const FIND_ROUTE = 'findRoute';

  /**
   * Perform authentication
   */
  export const AUTHENTICATION = 'authentication';

  /**
   * Parse the http request to extract parameter values for the operation
   */
  export const PARSE_PARAMS = 'parseParams';

  /**
   * Invoke the target controller method or handler function
   */
  export const INVOKE_METHOD = 'invokeMethod';
}

/**
 * A sequence implementation using middleware chains
 */
@injectable({scope: BindingScope.SINGLETON})
export class MiddlewareSequence implements SequenceHandler {
  private middlewareView: MiddlewareView;

  static defaultOptions: InvokeMiddlewareOptions = {
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
    orderedGroups: [
      // Please note that middleware is cascading. The `sendResponse` is
      // added first to invoke downstream middleware to get the result or
      // catch errors so that it can produce the http response.
      RestMiddlewareGroups.SEND_RESPONSE,

      RestMiddlewareGroups.CORS,
      RestMiddlewareGroups.API_SPEC,
      RestMiddlewareGroups.MIDDLEWARE,

      RestMiddlewareGroups.FIND_ROUTE,

      // authentication depends on the route
      RestMiddlewareGroups.AUTHENTICATION,

      RestMiddlewareGroups.PARSE_PARAMS,

      RestMiddlewareGroups.INVOKE_METHOD,
    ],

    /**
     * Reports an error if there are middleware groups are unreachable as they
     * are ordered after the `invokeMethod` group.
     */
    validate: groups => {
      const index = groups.indexOf(RestMiddlewareGroups.INVOKE_METHOD);
      if (index !== -1) {
        const unreachableGroups = groups.slice(index + 1);
        if (unreachableGroups.length > 0) {
          throw new Error(
            `Middleware groups "${unreachableGroups.join(
              ',',
            )}" are not invoked as they are ordered after "${
              RestMiddlewareGroups.INVOKE_METHOD
            }"`,
          );
        }
      }
    },
  };

  /**
   * Constructor: Injects `InvokeMiddleware` and `InvokeMiddlewareOptions`
   *
   * @param invokeMiddleware - invoker for registered middleware in a chain.
   * To be injected via RestBindings.INVOKE_MIDDLEWARE_SERVICE.
   */
  constructor(
    @inject.context()
    context: Context,

    @inject(RestBindings.INVOKE_MIDDLEWARE_SERVICE)
    readonly invokeMiddleware: InvokeMiddleware,
    @config()
    readonly options: InvokeMiddlewareOptions = MiddlewareSequence.defaultOptions,
  ) {
    this.middlewareView = new MiddlewareView(context, options);
    debug('Discovered middleware', this.middlewareView.middlewareBindingKeys);
  }

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these groups of middleware:
   *
   *  - `cors`: Enforces `CORS`
   *  - `openApiSpec`: Serves OpenAPI specs
   *  - `findRoute`: Finds the appropriate controller method, swagger spec and
   *    args for invocation
   *  - `parseParams`: Parses HTTP request to get API argument list
   *  - `invokeMethod`: Invokes the API which is defined in the Application
   *    controller method
   *
   * In front of the groups above, we have a special middleware called
   * `sendResponse`, which first invokes downstream middleware to get a result
   * and handles the result or error respectively.
   *
   *  - Writes the result from API into the HTTP response (if the HTTP response
   *    has not been produced yet by the middleware chain.
   *  - Catches error logs it using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    debug(
      'Invoking middleware chain %s with groups %s',
      this.options.chain,
      this.options.orderedGroups,
    );
    const options: InvokeMiddlewareOptions = {
      middlewareList: this.middlewareView.middlewareBindingKeys,
      validate: MiddlewareSequence.defaultOptions.validate,
      ...this.options,
    };
    await this.invokeMiddleware(context, options);
  }
}
