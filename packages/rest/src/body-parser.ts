// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationObject} from '@loopback/openapi-v3-types';
import * as debugModule from 'debug';
import * as HttpErrors from 'http-errors';
import {Request, Response, RequestBodyParserOptions} from './types';

import {
  json,
  urlencoded,
  text,
  OptionsJson,
  OptionsUrlencoded,
  OptionsText,
  Options,
} from 'body-parser';
import {inject} from '@loopback/context';
import {SchemaObject, ReferenceObject, isReferenceObject} from '..';
import {RestBindings} from './keys';
import {is} from 'type-is';

type HttpError = HttpErrors.HttpError;

const debug = debugModule('loopback:rest:body-parser');

export type RequestBody = {
  // tslint:disable:no-any
  value: any | undefined;
  coercionRequired?: boolean;
  mediaType?: string;
  schema?: SchemaObject | ReferenceObject;
};

/**
 * Get the content-type header value from the request
 * @param req Http request
 */
function getContentType(req: Request): string | undefined {
  return req.get('content-type');
}

/**
 * Express body parser function type
 */
type BodyParserWithCallback = (
  request: Request,
  response: Response,
  callback: (err: HttpError) => void,
) => void;

function normalizeParsingError(err: HttpError) {
  debug('Cannot parse request body %j', err);
  if (!err.statusCode || err.statusCode >= 500) {
    err.statusCode = 400;
  }
  return err;
}

/**
 * Parse the body asynchronously
 * @param handle The express middleware handler
 * @param request Http request
 */
function parse(
  handle: BodyParserWithCallback,
  request: Request,
): Promise<void> {
  // A hack to fool TypeScript as we don't need `response`
  const response = ({} as any) as Response;
  return new Promise<void>((resolve, reject) => {
    handle(request, response, err => {
      if (err) {
        reject(normalizeParsingError(err));
        return;
      }
      resolve();
    });
  });
}

// Default limit of the body length
const DEFAULT_LIMIT = '1mb';

type ParserOption<T extends 'json' | 'urlencoded' | 'text'> = T extends 'json'
  ? OptionsJson
  : T extends 'urlencoded'
    ? OptionsUrlencoded
    : T extends 'text' ? OptionsText : Options;

function getParserOptions<T extends 'json' | 'urlencoded' | 'text'>(
  type: T,
  options: RequestBodyParserOptions,
): ParserOption<T> {
  const opts: {[name: string]: any} = {};
  Object.assign(opts, options[type], options);
  for (const k of ['json', 'urlencoded', 'text']) {
    delete opts[k];
  }
  return opts as ParserOption<T>;
}

export class RequestBodyParser {
  private jsonParser: BodyParserWithCallback;
  private urlencodedParser: BodyParserWithCallback;
  private textParser: BodyParserWithCallback;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    const jsonOptions = Object.assign(
      {type: 'json', limit: DEFAULT_LIMIT},
      getParserOptions('json', options),
    );
    this.jsonParser = json(jsonOptions);

    const urlencodedOptions = Object.assign(
      {
        type: 'urlencoded',
        extended: true,
        limit: DEFAULT_LIMIT,
      },
      getParserOptions('urlencoded', options),
    );
    this.urlencodedParser = urlencoded(urlencodedOptions);

    const textOptions = Object.assign(
      {type: 'text/*', limit: DEFAULT_LIMIT},
      getParserOptions('text', options),
    );
    this.textParser = text(textOptions);
  }

  async parseJsonBody(request: Request, mediaType: string = 'json') {
    if (is(mediaType, 'json')) {
      await parse(this.jsonParser, request);
      return {value: request.body};
    }
    return undefined;
  }

  async parseUrlencodedBody(
    request: Request,
    mediaType: string = 'urlencoded',
  ) {
    if (is(mediaType, 'urlencoded')) {
      await parse(this.urlencodedParser, request);
      return {value: request.body, coercionRequired: true};
    }
    return undefined;
  }

  async parseTextBody(request: Request, mediaType: string = 'text/*') {
    if (is(mediaType, 'text/*')) {
      await parse(this.textParser, request);
      return {value: request.body};
    }
    return undefined;
  }

  private normalizeParsingError(err: HttpError) {
    debug('Cannot parse request body %j', err);
    if (!err.statusCode || err.statusCode >= 500) {
      err.statusCode = 400;
    }
    return err;
  }

  async loadRequestBodyIfNeeded(
    operationSpec: OperationObject,
    request: Request,
    options: RequestBodyParserOptions = {},
  ): Promise<RequestBody> {
    const requestBody: RequestBody = {
      value: undefined,
    };
    if (!operationSpec.requestBody) return Promise.resolve(requestBody);

    debug('Request body parser options: %j', options);

    const contentType = getContentType(request) || 'application/json';
    debug('Loading request body with content type %j', contentType);

    // the type of `operationSpec.requestBody` could be `RequestBodyObject`
    // or `ReferenceObject`, resolving a `$ref` value is not supported yet.
    if (isReferenceObject(operationSpec.requestBody)) {
      throw new Error('$ref requestBody is not supported yet.');
    }

    let content = operationSpec.requestBody.content || {};
    if (!Object.keys(content).length) {
      content = {
        // default to allow json and urlencoded
        'application/json': {schema: {type: 'object'}},
        'application/x-www-form-urlencoded': {schema: {type: 'object'}},
      };
    }

    // Check of the request content type matches one of the expected media
    // types in the request body spec
    let matchedMediaType: string | false = false;
    for (const type in content) {
      matchedMediaType = is(contentType, type);
      if (matchedMediaType) {
        requestBody.mediaType = type;
        requestBody.schema = content[type].schema;
        break;
      }
    }

    if (!matchedMediaType) {
      // No matching media type found, fail fast
      throw new HttpErrors.UnsupportedMediaType(
        `Content-type ${contentType} does not match [${Object.keys(content)}].`,
      );
    }

    try {
      let body = await this.parseJsonBody(request, matchedMediaType);
      if (body !== undefined) return Object.assign(requestBody, body);
      body = await this.parseUrlencodedBody(request, matchedMediaType);
      if (body !== undefined) return Object.assign(requestBody, body);
      body = await this.parseTextBody(request, matchedMediaType);
      if (body !== undefined) return Object.assign(requestBody, body);
    } catch (err) {
      throw this.normalizeParsingError(err);
    }

    throw new HttpErrors.UnsupportedMediaType(
      `Content-type ${matchedMediaType} is not supported.`,
    );
  }
}
