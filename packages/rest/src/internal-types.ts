// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BoundValue} from '@loopback/context';
import {ServerRequest, ServerResponse} from 'http';
import {ResolvedRoute, RouteEntry} from './router/routing-table';

export interface ParsedRequest extends ServerRequest {
  // see http://expressjs.com/en/4x/api.html#req.path
  path: string;
  // see http://expressjs.com/en/4x/api.html#req.query
  query: {[key: string]: string};
  // see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15808
  url: string;
  pathname: string;
  method: string;
}

/**
 * Find a route matching the incoming request.
 * Throw an error when no route was found.
 */
export type FindRoute = (request: ParsedRequest) => ResolvedRoute;

/**
 *
 */
export type ParseParams = (
  request: ParsedRequest,
  route: ResolvedRoute,
) => Promise<OperationArgs>;

/**
 * Invokes a method defined in the Application Controller
 *
 * @param controller Name of end-user's application controller
 *  class which defines the methods.
 * @param method Method name in application controller class
 * @param args Operation arguments for the method
 * @returns OperationRetval Result from method invocation
 */
export type InvokeMethod = (
  route: RouteEntry,
  args: OperationArgs,
) => Promise<OperationRetval>;

/**
 * Send the operation response back to the client.
 *
 * @param response The response the response to send to.
 * @param result The operation result to send.
 */
export type Send = (response: ServerResponse, result: OperationRetval) => void;

/**
 * Reject the request with an error.
 *
 * @param response The response the response to send to.
 * @param request The request that triggered the error.
 * @param err The error.
 */
export type Reject = (
  response: ServerResponse,
  request: ServerRequest,
  err: Error,
) => void;

/**
 * Log information about a failed request.
 *
 * @param err The error reported by request handling code.
 * @param statusCode Status code of the HTTP response
 * @param request The request that failed.
 */
export type LogError = (
  err: Error,
  statusCode: number,
  request: ServerRequest,
) => void;

// tslint:disable:no-any
export type PathParameterValues = {[key: string]: any};
export type OperationArgs = any[];

/**
 * Return value of a controller method (a function implementing an operation).
 * This is a type alias for "any", used to distinguish
 * operation results from other "any" typed values.
 */
export type OperationRetval = any;
// tslint:enable:no-any

export type GetFromContext = (key: string) => Promise<BoundValue>;
export type BindElement = (key: string) => Binding;
