// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HandlerContext, Request, Response} from '@loopback/express';
import {ReferenceObject, SchemaObject} from '@loopback/openapi-v3';
import Ajv, {
  ErrorObject,
  FormatDefinition,
  KeywordDefinition,
  Options as AjvOptions,
  ValidateFunction,
} from 'ajv';
import {ErrorMessageOptions} from 'ajv-errors';
import {
  Options,
  OptionsJson,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';
import {ResolvedRoute, RouteEntry} from './router';

/**
 * Re-export types from `./middleware`
 */
export * from '@loopback/express';

/**
 * Find a route matching the incoming request.
 * Throw an error when no route was found.
 */
export type FindRoute = (request: Request) => ResolvedRoute;

/**
 * A function to parse OpenAPI operation parameters for a given route
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
  Map<string, ValidateFunction> // Second level keyed by stringified AJV options
>;

/**
 * Options for AJV errors
 */
export type AjvErrorOptions = ErrorMessageOptions;

/**
 * Factory function for Ajv instances
 */
export type AjvFactory = (options?: AjvOptions) => Ajv;

/**
 * Ajv keyword definition with a name
 */
export type AjvKeyword = KeywordDefinition;

/**
 * Ajv format definition with a name
 */
export type AjvFormat<T extends string | number = string> =
  FormatDefinition<T> & {name: string};

/**
 * Options for any value validation using AJV
 */
export interface ValueValidationOptions extends ValidationOptions {
  /**
   * Where the data comes from. It can be 'body', 'path', 'header',
   * 'query', 'cookie', etc...
   */
  source?: string;

  /**
   * Parameter name, as provided in `ParameterObject#name` property.
   */
  name?: string;
}

/**
 * Options for request body validation using AJV
 */
export interface ValidationOptions extends AjvOptions {
  /**
   * Custom cache for compiled schemas by AJV. This setting makes it possible
   * to skip the default cache.
   */
  compiledSchemaCache?: SchemaValidatorCache;
  /**
   * Enable additional AJV keywords from https://github.com/epoberezkin/ajv-keywords
   * - `string[]`: Add an array of keywords from `ajv-keywords`
   */
  ajvKeywords?: string[];
  /**
   * Enable custom error messages in JSON-Schema for AJV validator
   * from https://github.com/epoberezkin/ajv-errors
   * - `true`: Enable `ajv-errors`
   * - `AjvErrorOptions`: Enable `ajv-errors` with options
   */
  ajvErrors?: AjvErrorOptions;
  /**
   * A function that transform the `ErrorObject`s reported by AJV.
   * This could be used for error messages customization, localization, etc.
   */
  ajvErrorTransformer?: (errors: ErrorObject[]) => ErrorObject[];

  /**
   * A factory to create Ajv instance
   */
  ajvFactory?: (options: AjvOptions) => Ajv;

  /**
   * An array of keys to be rejected, such as `__proto__`.
   */
  prohibitedKeys?: string[];
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
  validation?: ValidationOptions;
  /**
   * Common options for all parsers
   */
  [name: string]: unknown;
}

export type PathParameterValues = {[key: string]: any};
export type OperationArgs = any[];

/**
 * Return value of a controller method (a function implementing an operation).
 * This is a type alias for "any", used to distinguish
 * operation results from other "any" typed values.
 */
export type OperationRetval = any;

/**
 * user profile to add in session
 */
export interface SessionUserProfile {
  provider: string;
  token: string;
  email: string;
  [attribute: string]: any;
}

/**
 * interface to set variables in user session
 */
export interface Session {
  profile: SessionUserProfile;
  [key: string]: any;
}

/**
 * extending express request type with a session field
 */
export interface RequestWithSession extends Request {
  session: Session;
}

// For backwards compatibility
// TODO(SEMVER-MAJOR)
export type RequestBodyValidationOptions = ValidationOptions;
