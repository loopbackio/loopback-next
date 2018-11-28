// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP Request/Response mocks
 * https://github.com/hapijs/shot
 */

// tslint:disable:no-any

import {IncomingMessage, ServerResponse} from 'http';
import * as util from 'util';

import {
  RequestOptions as ShotRequestOptions,
  ResponseObject,
  inject,
} from 'shot';

import * as express from 'express';

export {inject, ShotRequestOptions};

// tslint:disable-next-line:variable-name
const ShotRequest: ShotRequestCtor = require('shot/lib/request');
type ShotRequestCtor = new (options: ShotRequestOptions) => IncomingMessage;

export function stubServerRequest(
  options: ShotRequestOptions,
): IncomingMessage {
  const stub = new ShotRequest(options);
  // Hacky workaround for Express, see
  // https://github.com/expressjs/express/blob/4.16.3/lib/middleware/init.js
  // https://github.com/hapijs/shot/issues/82#issuecomment-247943773
  // https://github.com/jfhbrook/pickleback
  Object.assign(stub, ShotRequest.prototype);
  return stub;
}

// tslint:disable-next-line:variable-name
const ShotResponse: ShotResponseCtor = require('shot/lib/response');
export type ShotCallback = (response: ResponseObject) => void;

export type ShotResponseCtor = new (
  request: IncomingMessage,
  onEnd: ShotCallback,
) => ServerResponse;

export function stubServerResponse(
  request: IncomingMessage,
  onEnd: ShotCallback,
): ServerResponse {
  const stub = new ShotResponse(request, onEnd);
  // Hacky workaround for Express, see
  // https://github.com/expressjs/express/blob/4.16.3/lib/middleware/init.js
  // https://github.com/hapijs/shot/issues/82#issuecomment-247943773
  // https://github.com/jfhbrook/pickleback
  Object.assign(stub, ShotResponse.prototype);
  return stub;
}

export type ObservedResponse = ResponseObject;

export interface HandlerContextStub {
  request: IncomingMessage;
  response: ServerResponse;
  result: Promise<ObservedResponse>;
}

export function stubHandlerContext(
  requestOptions: ShotRequestOptions = {url: '/'},
): HandlerContextStub {
  const request = stubServerRequest(requestOptions);
  let response: ServerResponse | undefined;
  let result = new Promise<ObservedResponse>(resolve => {
    response = new ShotResponse(request, resolve);
  });

  const context = {request, response: response!, result};
  defineCustomContextInspect(context, requestOptions);
  return context;
}

export interface ExpressContextStub extends HandlerContextStub {
  app: express.Application;
  request: express.Request;
  response: express.Response;
  result: Promise<ObservedResponse>;
}

export function stubExpressContext(
  requestOptions: ShotRequestOptions = {url: '/'},
): ExpressContextStub {
  const app = express();

  const request = new ShotRequest(requestOptions) as express.Request;
  // mix in Express Request API
  const RequestApi = (express as any).request;
  for (const key of Object.getOwnPropertyNames(RequestApi)) {
    Object.defineProperty(
      request,
      key,
      Object.getOwnPropertyDescriptor(RequestApi, key)!,
    );
  }
  request.app = app;
  request.originalUrl = request.url;
  parseQuery(request);

  let response: express.Response | undefined;
  let result = new Promise<ObservedResponse>(resolve => {
    response = new ShotResponse(request, resolve) as express.Response;
    // mix in Express Response API
    Object.assign(response, (express as any).response);
    const ResponseApi = (express as any).response;
    for (const key of Object.getOwnPropertyNames(ResponseApi)) {
      Object.defineProperty(
        response,
        key,
        Object.getOwnPropertyDescriptor(ResponseApi, key)!,
      );
    }
    response.app = app;
    (response as any).req = request;
    (request as any).res = response;
  });

  const context = {app, request, response: response!, result};
  defineCustomContextInspect(context, requestOptions);
  return context;
}

/**
 * Use `express.query` to parse the query string into `request.query` object
 * @param request Express http request object
 */
function parseQuery(request: express.Request) {
  // Use `express.query` to parse the query string
  // See https://github.com/expressjs/express/blob/master/lib/express.js#L79
  // See https://github.com/expressjs/express/blob/master/lib/middleware/query.js
  (express as any).query()(request, {}, () => {});
}

function defineCustomContextInspect(
  context: HandlerContextStub,
  requestOptions: ShotRequestOptions,
) {
  // Setup custom inspect functions to make test error messages easier to read
  const inspectOpts = (depth: number, opts: any) =>
    util.inspect(requestOptions, opts);

  defineCustomInspect(
    context.request,
    (depth, opts) => `[RequestStub with options ${inspectOpts(depth, opts)}]`,
  );

  defineCustomInspect(
    context.response,
    (depth, opts) =>
      `[ResponseStub for request with options ${inspectOpts(depth, opts)}]`,
  );

  context.result = context.result.then(r => {
    defineCustomInspect(
      r,
      (depth, opts) =>
        `[ObservedResponse for request with options ${inspectOpts(
          depth,
          opts,
        )}]`,
    );
    return r;
  });
}

function defineCustomInspect(
  obj: any,
  inspectFn: (depth: number, opts: any) => {},
) {
  obj[util.inspect.custom] = inspectFn;
}
