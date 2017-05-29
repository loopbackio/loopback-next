// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './application';
import {Server} from './server';
const debug = require('debug')('loopback:core:sequence');
import {OperationRetval} from './invoke';
import {ServerRequest, ServerResponse} from 'http';
import {ResolvedRoute, ParsedRequest} from './router/routing-table';
import {OperationArgs, parseOperationArgs} from './parser';
import {writeResultToResponse} from './writer';
import {HttpError} from 'http-errors';

export type FindRoute = (request: ParsedRequest) => ResolvedRoute<string>;
export type InvokeMethod =
  (controller: string, method: string, args: OperationArgs) => Promise<OperationRetval>;

export class Sequence {
    constructor(
      protected findRoute: FindRoute,
      protected invoke: InvokeMethod) {
    }

  async run(server: Server, req: ParsedRequest, res: ServerResponse) {
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
    console.error('Unhandled error in %s %s: %s %s',
      req.method, req.url, statusCode, err.stack || err);
    res.statusCode = statusCode;
    res.end();
  }
}
