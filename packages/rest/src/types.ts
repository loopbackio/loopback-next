// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingSpec,
  BindingTemplate,
  Context,
  GenericInterceptor,
  InvocationArgs,
  InvocationResult,
} from '@loopback/context';
import {ReferenceObject, SchemaObject} from '@loopback/openapi-v3';
import * as ajv from 'ajv';
import {
  Options,
  OptionsJson,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';
import {Request, Response} from 'express';
import {RestTags} from './keys';
import {ResolvedRoute, RouteEntry} from './router';

export {Request, Response};

/**
 * An object holding HTTP request, response and other data
 * needed to handle an incoming HTTP request.
 */
export interface HandlerContext {
  readonly request: Request;
  readonly response: Response;
}

/**
 * Find a route matching the incoming request.
 * Throw an error when no route was found.
 */
export type FindRoute = (request: Request) => ResolvedRoute;

/**
 *
 */
export type ParseParams = (
  request: Request,
  route: ResolvedRoute,
) => Promise<OperationArgs>;

/**
 * Invokes a method defined in the Application Controller
 *
 * @param controller - Name of end-user's application controller
 *  class which defines the methods.
 * @param method - Method name in application controller class
 * @param args - Operation arguments for the method
 * @returns OperationRetval Result from method invocation
 */
export type InvokeMethod = (
  route: RouteEntry,
  args: OperationArgs,
) => Promise<OperationRetval>;

/**
 * Send the operation response back to the client.
 *
 * @param response - The response the response to send to.
 * @param result - The operation result to send.
 */
export type Send = (response: Response, result: OperationRetval) => void;

/**
 * Reject the request with an error.
 *
 * @param handlerContext - The context object holding HTTP request, response
 * and other data  needed to handle an incoming HTTP request.
 * @param err - The error.
 */
export type Reject = (handlerContext: HandlerContext, err: Error) => void;

/**
 * Log information about a failed request.
 *
 * @param err - The error reported by request handling code.
 * @param statusCode - Status code of the HTTP response
 * @param request - The request that failed.
 */
export type LogError = (
  err: Error,
  statusCode: number,
  request: Request,
) => void;

/**
 * Cache for AJV schema validators
 */
export type SchemaValidatorCache = WeakMap<
  SchemaObject | ReferenceObject, // First keyed by schema object
  Map<string, ajv.ValidateFunction> // Second level keyed by stringified AJV options
>;

/**
 * Options for request body validation using AJV
 */
export interface RequestBodyValidationOptions extends ajv.Options {
  /**
   * Custom cache for compiled schemas by AJV. This setting makes it possible
   * to skip the default cache.
   */
  compiledSchemaCache?: SchemaValidatorCache;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Options for request body parsing
 * See https://github.com/expressjs/body-parser/#options
 *
 * Built-in parsers retrieve their own options from the request body parser
 * options. The parser specific properties override common ones.
 */
export interface RequestBodyParserOptions extends Options {
  /**
   * Options for json parser
   */
  json?: OptionsJson;
  /**
   * Options for urlencoded parser
   */
  urlencoded?: OptionsUrlencoded;
  /**
   * Options for text parser
   */
  text?: OptionsText;
  /**
   * Options for raw parser
   */
  raw?: Options;
  /**
   * Validation options for AJV, see https://github.com/epoberezkin/ajv#options
   * This setting is global for all request body parsers and it cannot be
   * overridden inside parser specific properties such as `json` or `text`.
   */
  validation?: RequestBodyValidationOptions;
  /**
   * Common options for all parsers
   */
  [name: string]: unknown;
}

// tslint:disable-next-line:no-any
export type PathParameterValues = {[key: string]: any};
export type OperationArgs = InvocationArgs;

/**
 * Return value of a controller method (a function implementing an operation).
 * This is a type alias for "any", used to distinguish
 * operation results from other "any" typed values.
 */
export type OperationRetval = InvocationResult;

export interface RestAction {
  action: GenericInterceptor<HandlerContext & Context>;
}

export function asRestAction(phase?: string) {
  const template: BindingTemplate = binding => {
    binding.tag(RestTags.ACTION);
    if (phase) binding.tag({[RestTags.ACTION_PHASE]: phase});
  };
  return template;
}

/**
 * `@restAction` decorator to mark a provider class as RestAction
 * @param phase Phase
 * @param specs
 */
export function restAction(phase?: string, ...specs: BindingSpec[]) {
  return bind(asRestAction(phase), ...specs);
}
