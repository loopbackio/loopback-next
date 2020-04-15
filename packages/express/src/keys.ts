// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {MiddlewareContext} from './types';

export namespace MiddlewareBindings {
  /**
   * Binding key for setting and injecting the http request context
   */
  export const CONTEXT = BindingKey.create<MiddlewareContext>(
    'middleware.http.context',
  );
}
