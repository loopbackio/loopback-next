// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {MiddlewareContext, MiddlewareGroups} from './types';

export namespace MiddlewareBindings {
  /**
   * Binding key for setting and injecting the http request context
   */
  export const CONTEXT = BindingKey.create<MiddlewareContext>(
    'middleware.http.context',
  );
}

/**
 * Default namespaces for middleware
 */
export const MIDDLEWARE_NAMESPACE = 'middleware';

/**
 * Default namespace for Express middleware based global interceptors
 */
export const GLOBAL_MIDDLEWARE_INTERCEPTOR_NAMESPACE =
  'globalInterceptors.middleware';

/**
 * Default namespace for Express middleware based local interceptors
 */
export const MIDDLEWARE_INTERCEPTOR_NAMESPACE = 'globalInterceptors.middleware';

/**
 * Default order group name for Express middleware based global interceptors
 */
export const DEFAULT_MIDDLEWARE_GROUP = MiddlewareGroups.DEFAULT;
