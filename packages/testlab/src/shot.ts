// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP Request/Response mocks
 * https://github.com/hapijs/shot
 */

import {ServerRequest, ServerResponse} from 'http';

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

export type ShotRequestCtor =
  new (options: ShotRequestOptions) => ServerRequest;

export type ShotCallback = (response: ResponseObject) => void;

export type ShotResponseCtor =
  new (request: ServerRequest, onEnd: ShotCallback) => ServerResponse;

export type ShotObservedResponse = ResponseObject;
