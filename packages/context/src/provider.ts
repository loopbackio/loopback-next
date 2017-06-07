// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueOrPromise} from './binding';

/**
 * @exports Provider<T> : interface definition for a provider of a value of type T
 * @summary Providers allow binding of a value provider class instead of the value itself
 * @example:
 * ```ts
 * export class DateProvider implements Provider<Date> {
 *   constructor(@inject('stringDate') private param: String){}
 *   value(): Date {
 *     return new Date(param);
 *   }
 * }
 * ```
 * @example: Binding a context
 * ```ts
 * ctx.bind('provider_key').toProvider(MyProvider);
 * ```
 * @example: getting a value dynamically
 * ```ts
 * ctx.get('provider_key');
 * ctx.getBinding('provider_key').getValue();
 * ```
 */
export interface Provider<T> {
  /**
   * @returns a value or a promise
   */
  value(): ValueOrPromise<T>;
}
