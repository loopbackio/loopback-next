// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerRequest} from 'http';
import {ResolvedRoute} from './router/routing-table';

export interface ParsedRequest extends ServerRequest {
  // see http://expressjs.com/en/4x/api.html#req.path
  path: string;
  // see http://expressjs.com/en/4x/api.html#req.query
  query: { [key: string]: string };
  // see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15808
  url: string;
  pathname: string;
  method: string;
}

export type FindRoute = (request: ParsedRequest) => ResolvedRoute<string>;
export type InvokeMethod = (controller: string, method: string, args: OperationArgs) => Promise<OperationRetval>;
export type LogError = (err: Error, statusCode: number, request: ServerRequest) => void;

// tslint:disable:no-any
export type PathParameterValues = {[key: string]: any};
export type OperationArgs = any[];
export type OperationRetval = any;
// tslint:enable:no-any

