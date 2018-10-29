// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Options,
  OptionsJson,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';
import * as debugModule from 'debug';
import {HttpError} from 'http-errors';
import {Request, RequestBodyParserOptions, Response} from '../types';

const debug = debugModule('loopback:rest:body-parser');

/**
 * Get the content-type header value from the request
 * @param req Http request
 */
export function getContentType(req: Request): string | undefined {
  return req.get('content-type');
}

/**
 * Express body parser function type
 */
export type BodyParserMiddleware = (
  request: Request,
  response: Response,
  next: (err: HttpError) => void,
) => void;

/**
 * Normalize parsing errors as `4xx`
 * @param err
 */
export function normalizeParsingError(err: HttpError) {
  debug('Cannot parse request body %j', err);
  if (!err.statusCode || err.statusCode >= 500) {
    err.statusCode = 400;
  }
  return err;
}

// tslint:disable:no-any

/**
 * Parse the request body asynchronously
 * @param handle The express middleware handler
 * @param request Http request
 */
export function invokeBodyParserMiddleware(
  handle: BodyParserMiddleware,
  request: Request,
): Promise<any> {
  // A hack to fool TypeScript as we don't need `response`
  const response = ({} as any) as Response;
  return new Promise<void>((resolve, reject) => {
    handle(request, response, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve(request.body);
    });
  });
}

// Default limit of the body length
export const DEFAULT_LIMIT = '1mb';

/**
 * Extract parser options based on the parser type
 * @param type json|urlencoded|text
 * @param options
 */
export function getParserOptions(
  type: 'json',
  options: RequestBodyParserOptions,
): OptionsJson;
export function getParserOptions(
  type: 'urlencoded',
  options: RequestBodyParserOptions,
): OptionsUrlencoded;
export function getParserOptions(
  type: 'text',
  options: RequestBodyParserOptions,
): OptionsText;
export function getParserOptions(
  type: 'raw',
  options: RequestBodyParserOptions,
): Options;

export function getParserOptions(
  type: 'json' | 'urlencoded' | 'text' | 'raw',
  options: RequestBodyParserOptions,
) {
  const opts: {[name: string]: any} = {limit: DEFAULT_LIMIT};
  switch (type) {
    case 'json':
      // Allow */json and */*+json
      opts.type = ['*/json', '*/*+json'];
      opts.strict = false;
      break;
    case 'urlencoded':
      opts.type = type;
      opts.extended = true;
      break;
    case 'text':
      // Set media type to `text/*` to match `text/plain` or `text/html`
      opts.type = 'text/*';
      break;
    case 'raw':
      opts.type = ['application/octet-stream', '*/*'];
      break;
  }
  Object.assign(opts, options[type], options);
  for (const k of ['json', 'urlencoded', 'text', 'raw']) {
    delete opts[k];
  }
  return opts;
}

export namespace builtinParsers {
  export const json = Symbol('json');
  export const urlencoded = Symbol('urlencoded');
  export const text = Symbol('text');
  export const raw = Symbol('raw');
  export const stream = Symbol('stream');

  export const names: (string | symbol)[] = [
    json,
    urlencoded,
    text,
    raw,
    stream,
  ];

  export const mapping: {[name: string]: symbol} = {
    json,
    urlencoded,
    text,
    raw,
    stream,
  };
}
