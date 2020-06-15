// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')('loopback:rest:sequence');
import {inject, InvocationResult, Next, ValueOrPromise} from '@loopback/core';
import {InvokeMiddleware} from '@loopback/express';
import {RestBindings} from './keys';
import {RequestContext} from './request-context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  Request,
  Send,
} from './types';

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
  static noOp = () => false;
  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = DefaultSequence.noOp;

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

      let result: InvocationResult = response;
      // Wrap actions in a handler so that middleware can intercept both
      // request/response processing by the actions
      const actions: Next = async () => {
        result = await this.invokeActions(request);
        return result;
      };

      let finished = false;
      // Invoke registered middleware
      if (this.invokeMiddleware !== DefaultSequence.noOp) {
        finished = await this.invokeMiddleware(context, {
          // Cascade to actions
          next: actions,
        });
      } else {
        await actions();
      }
      if (!finished) {
        // We defer the `send` of invocation result to http response so that
        // middleware can set http status code and response headers. For example,
        // a rate limiting middleware may add response headers to tell how much
        // data is allowed after this request.
        this.send(response, result);
      }
    } catch (error) {
      this.reject(context, error);
    }
  }

  protected async invokeActions(request: Request): Promise<InvocationResult> {
    const route = this.findRoute(request);
    const args = await this.parseParams(request, route);
    const result = await this.invoke(route, args);
    debug('%s result -', route.describe(), result);
    return result;
  }
}
