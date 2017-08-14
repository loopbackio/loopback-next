// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')('loopback:core:sequence');
import {ServerRequest, ServerResponse} from 'http';
import {inject, Context} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  LogError,
  OperationRetval,
  ParsedRequest,
  Send,
  Reject,
  ParseParams,
} from './internal-types';
import {CoreBindings} from './keys';
import {writeResultToResponse} from './writer';
import {HttpError} from 'http-errors';

const SequenceActions = CoreBindings.SequenceActions;

/**
 * A sequence function is a function implementing a custom
 * sequence of actions to handle an incoming request.
 */
export type SequenceFunction = (
  sequence: DefaultSequence,
  request: ParsedRequest,
  response: ServerResponse,
) => Promise<void> | void;

/**
 * A sequence handler is a class implementing sequence of actions
 * required to handle an incoming request.
 */
export interface SequenceHandler {
  /**
   * Handle the request by running the configured sequence of actions.
   *
   * @param request The incoming HTTP request
   * @param response The HTTP server response where to write the result
   */
  handle(request: ParsedRequest, response: ServerResponse): Promise<void>;
}

/**
 * The default implementation of SequenceHandler.
 *
 * This class implements default Sequence for the LoopBack framework.
 * Default sequence is used if user hasn't defined their own Sequence
 * for their application.
 *
 * Sequence constructor() and run() methods are invoked from [[http-handler]]
 * when the API request comes in. User defines APIs in their Application
 * Controller class.
 *
 * User can bind their own Sequence to app as shown below
 * ```ts
 * app.bind(CoreBindings.SEQUENCE).toClass(MySequence);
 * ```
 */
export class DefaultSequence implements SequenceHandler {
   /**
   * Constructor: Injects findRoute, invokeMethod & logError
   * methods as promises.
   *
   * @param findRoute Finds the appropriate controller method,
   *  spec and args for invocation
   * @param invoke Invokes the method
   * @param logError Logs error
   */
  constructor(
    @inject(CoreBindings.Http.CONTEXT) public ctx: Context,
    @inject(SequenceActions.FIND_ROUTE)
    protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}


  /**
   * Runs the default sequence. Given a request and response, running the
   * sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   * @param req Parsed incoming HTTP request
   * @param res HTTP server response with result from Application controller
   *  method invocation
   */
  async handle(req: ParsedRequest, res: ServerResponse) {
    try {
      const route = this.findRoute(req);
      const args = await this.parseParams(req, route);
      const result = await this.invoke(route, args);

      debug('%s result -', route.describe(), result);
      this.send(res, result);
    } catch (err) {
      this.reject(res, req, err);
    }
  }
}
