// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP Request/Response mocks
 * https://github.com/hapijs/shot
 */

import {Request, Response} from 'express';
import * as util from 'util';

import {
  RequestOptions as ShotRequestOptions,
  ResponseObject,
  inject,
} from 'shot';

export {inject, ShotRequestOptions};

// tslint:disable-next-line:variable-name
export const ShotRequest: ShotRequestCtor = require('shot/lib/request');

// tslint:disable-next-line:variable-name
export const ShotResponse: ShotResponseCtor = require('shot/lib/response');

export type ShotRequestCtor = new (options: ShotRequestOptions) => Request;

export type ShotCallback = (response: ResponseObject) => void;

export type ShotResponseCtor = new (
  request: Request,
  onEnd: ShotCallback,
) => Response;

export type ShotObservedResponse = ResponseObject;

export interface ShotResponseMock {
  request: Request;
  response: Response;
  result: Promise<ShotObservedResponse>;
}

export function mockResponse(
  requestOptions: ShotRequestOptions = {url: '/'},
): ShotResponseMock {
  const request = new ShotRequest(requestOptions);
  let response: Response | undefined;
  let result = new Promise<ShotObservedResponse>(resolve => {
    response = new ShotResponse(request, resolve);
  });

  // Setup custom inspect functions to make test error messages easier to read
  const inspectOpts = (depth: number) => util.inspect(requestOptions, {depth});
  defineCustomInspect(
    request,
    depth => `[ShotRequest with options ${inspectOpts(depth)}]`,
  );

  defineCustomInspect(
    response,
    depth => `[ShotResponse for request with options ${inspectOpts(depth)}]`,
  );

  result = result.then(r => {
    defineCustomInspect(
      r,
      depth =>
        `[ShotObservedResponse for request with options ${inspectOpts(depth)}]`,
    );
    return r;
  });

  return {request, response: response!, result};
}

// tslint:disable:no-any
function defineCustomInspect(obj: any, inspectFn: (depth: number) => {}) {
  obj.inspect = obj.toString = inspectFn;
}
// tslint:enable:no-any
