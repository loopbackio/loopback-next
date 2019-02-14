// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/express-middleware
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ErrorRequestHandler, RequestHandler} from 'express';
import {PathParams} from 'express-serve-static-core';

export type ExpressRequestMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';

/**
 * Spec for a middleware entry
 */
export interface MiddlewareSpec {
  name?: string;
  // Path to be mounted
  path?: PathParams;
  // Optional phase for ordering
  phase?: string;
  // Optional method for route handlers
  method?: ExpressRequestMethod;
}

/**
 * Express normal request middleware
 */
export type MiddlewareRequestHandler = RequestHandler | RequestHandler[];

/**
 * Express error request middleware
 */
export type MiddlewareErrorHandler =
  | ErrorRequestHandler
  | ErrorRequestHandler[];

export type MiddlewareHandler =
  | MiddlewareRequestHandler
  | MiddlewareErrorHandler;

export type MiddlewareRegistryOptions = {
  phasesByOrder: string[];
  parallel?: boolean;
};
