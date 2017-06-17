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
} from './internal-types';
import {parseOperationArgs} from './parser';
import {writeResultToResponse} from './writer';
import {HttpError} from 'http-errors';
/**
 * The default implementation of Sequence.
 *
 * This class implements default Sequence for the LoopBack framework.
 * Default sequence is used if user hasn't defined their own Sequence
 * for their application.
 *
 * Sequence constructor() and run() methods are invoked from [[http-handler]]
 * when the API request comes in. User defines APIs in their Application
 * Controller class.
 *
 * Sequence executes these steps
 *  - Finds the appropriate controller method, swagger spec
 *    and args for invocation
 *  - Parses HTTP request to get API argument list
 *  - Invokes the API which is defined in the Application Controller
 *  - Writes the result from API into the HTTP response
 *
 * User can bind their own Sequence to app as shown below
 * ```ts
 * app.bind('sequence').toClass(MySequence);
 * ```
 */
export class Sequence {
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
    @inject('logError') protected logError: LogError,
  ) {}
  /**
   * Runs the sequence
   *
   * @param req Parsed incoming HTTP request
   * @param res HTTP server response with result from Application controller
   *  method invocation
   */
  async run(req: ParsedRequest, res: ServerResponse) {
    try {
      const {controller, methodName, spec, pathParams} = this.findRoute(req);
      const args = await parseOperationArgs(req, spec, pathParams);
      const result = await this.invoke(controller, methodName, args);
      debug('%s.%s() result -', controller, methodName, result);
      this.sendResponse(res, result);
    } catch (err) {
      this.sendError(res, req, err);
    }
  }
   /**
   * Sends API result in HTTP response
   *
   * @param res HTTP server response to write the result of method invocation
   * @param result Result from method invocation
   */
  sendResponse(response: ServerResponse, result: OperationRetval) {
    writeResultToResponse(response, result);
  }
   /**
   * Logs error
   *
   * @param res HTTP server response to write the error status and error code
   * @param req Incoming HTTP request
   */
  sendError(res: ServerResponse, req: ServerRequest, err: HttpError) {
    const statusCode = err.statusCode || err.status || 500;
    res.statusCode = statusCode;
    res.end();

    this.logError(err, statusCode, req);
  }
}
