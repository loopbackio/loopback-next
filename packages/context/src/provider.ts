// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueOrPromise} from './value-promise';

/**
 * Providers allow developers to compute injected values dynamically,
 * with any dependencies required by the value getter injected automatically
 * from the Context.
 *
 * @example
 *
 * ```ts
 * export class DateProvider implements Provider<Date> {
 *   constructor(@inject('stringDate') private param: String){}
 *   value(): Date {
 *     return new Date(param);
 *   }
 * }
 *
 * ctx.bind('stringDate').to('2017-01-01')
 * ctx.bind('provider_key').toProvider(DateProvider);
 *
 * const value = ctx.getAsync('provider_key');
 * // value is a Date instance
 * ```
 */
export interface Provider<T> {
  /**
   * @returns The value to inject to dependents.
   * This method can return a promise too, in which case the IoC framework
   * will resolve this promise to obtain the value to inject.
   */
  value(): ValueOrPromise<T>;
}
