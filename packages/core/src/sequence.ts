// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './application';
const debug = require('debug')('loopback:core:sequence');
import {ServerRequest, ServerResponse} from 'http';
import {ResolvedRoute} from './router/routing-table';
import {
  OperationArgs,
  OperationRetval,
  ParsedRequest,
} from './internal-types';
import {parseOperationArgs} from './parser';
import {writeResultToResponse} from './writer';
import {HttpError} from 'http-errors';

export type FindRoute = (request: ParsedRequest) => ResolvedRoute<string>;
export type InvokeMethod =
  (controller: string, method: string, args: OperationArgs) => Promise<OperationRetval>;
export type LogError =
  (err: Error, statusCode: number, request: ServerRequest) => void;

export class Sequence {
    constructor(
      protected findRoute: FindRoute,
      protected invoke: InvokeMethod,
      protected logError: LogError) {
    }

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
