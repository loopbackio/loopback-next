// Copyright IBM Corp. and LoopBack contributors 2017,2019. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP Request/Response mocks
 * https://github.com/hapijs/shot
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import express from 'express';
import {IncomingMessage, ServerResponse} from 'http';
import {
  Listener as ShotListener,
  RequestOptions as ShotRequestOptions,
  ResponseObject,
} from 'shot'; // <-- workaround for missing type-defs for @hapi/shot
import util from 'util';

const inject: (
  dispatchFunc: ShotListener,
  options: ShotRequestOptions,
) => Promise<ResponseObject> = require('@hapi/shot');
// ^^ workaround for missing type-defs for @hapi/shot

export {inject, ShotRequestOptions};

const ShotRequest: ShotRequestCtor = require('@hapi/shot/lib/request');
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

const ShotResponse: ShotResponseCtor = require('@hapi/shot/lib/response');
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
  const result = new Promise<ObservedResponse>(resolve => {
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
  const result = new Promise<ObservedResponse>(resolve => {
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
 * @param request - Express http request object
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

// @types/node@v10.17.29 seems to miss the type definition of `util.inspect.custom`
// error TS2339: Property 'custom' does not exist on type 'typeof inspect'.
// Use a workaround for now to access the `custom` symbol for now.
// https://nodejs.org/api/util.html#util_util_inspect_custom
const custom = Symbol.for('nodejs.util.inspect.custom');

function defineCustomInspect(
  obj: any,
  inspectFn: (depth: number, opts: any) => {},
) {
  obj[custom] = inspectFn;
}
