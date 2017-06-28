// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')('loopback:core:sequence');
import {ServerRequest, ServerResponse} from 'http';
import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  LogError,
  OperationRetval,
  ParsedRequest,
  Send,
  Reject,
} from './internal-types';
import {parseOperationArgs} from './parser';
import {writeResultToResponse} from './writer';
import {HttpError} from 'http-errors';

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
 * app.bind('sequence').toClass(MySequence);
 * ```
 */
export class Sequence implements SequenceHandler{
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
    @inject('findRoute') protected findRoute: FindRoute,
    @inject('invokeMethod') protected invoke: InvokeMethod,
    @inject('sequence.actions.send') protected send: Send,
    @inject('sequence.actions.reject') protected reject: Reject,
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
      const {controller, methodName, spec, pathParams} = this.findRoute(req);
      const args = await parseOperationArgs(req, spec, pathParams);
      const result = await this.invoke(controller, methodName, args);
      debug('%s.%s() result -', controller, methodName, result);
      this.send(res, result);
    } catch (err) {
      this.reject(res, req, err);
    }
  }
}
