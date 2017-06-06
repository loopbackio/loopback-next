// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {BoundValue, ValueOrPromise} from './binding';
import {Constructor, instantiateClass} from './resolver';

/**
 * Provider of a value
 */
export interface Provider<T> {
  value(ctx?: Context): ValueOrPromise<T>;
}
