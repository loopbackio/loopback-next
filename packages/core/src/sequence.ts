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

export class Sequence {
  constructor(
    @inject('findRoute')
    protected findRoute: FindRoute,
    @inject('invokeMethod')
    protected invoke: InvokeMethod,
    @inject('logError')
    protected logError: LogError) {
  }

  async run(req: ParsedRequest, res: ServerResponse) {
    try {
      const { controller, methodName, spec, pathParams } = this.findRoute(req);
      const args = await parseOperationArgs(req, spec, pathParams);
      const result = await this.invoke(controller, methodName, args);
      debug('%s.%s() result -', controller, methodName, result);
      this.sendResponse(res, result);
    } catch (err) {
      this.sendError(res, req, err);
    }
  }

  sendResponse(response: ServerResponse, result: OperationRetval) {
    writeResultToResponse(response, result);
  }

  sendError(res: ServerResponse, req: ServerRequest, err: HttpError) {
    const statusCode = err.statusCode || err.status || 500;
    res.statusCode = statusCode;
    res.end();

    this.logError(err, statusCode, req);
  }
}
