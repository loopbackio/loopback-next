// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from './common-types';

// tslint:disable:no-any

/**
 * Interface for functions that can mix properties/methods into a base class
 *
 * For example,
 * ```
 * var calculatorMixin = Base => class extends Base {
 *   calc() { }
 * };
 *
 * function timestampMixin(Base) {
 *   return class extends Base {
 *     created: Date = new Date();
 *     modified: Date = new Date();
 *   }
 * }
 * ```
 * See http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/.
 */
export interface MixinFunc {
  <BC extends Class<any>>(baseClass: BC): BC;
}

/**
 * A builder to compose mixins
 */
export class MixinBuilder {
  /**
   * Constructor for MixinBuilder
   * @param baseClass The base class
   */
  constructor(public baseClass: Class<any>) {}

  /**
   * Apply one or more mixin functions
   * @param mixins An array of mixin functions
   */
  with(...mixins: MixinFunc[]) {
    return mixins.reduce((c, mixin) => mixin(c), this.baseClass);
  }

  /**
   * Create an instance of MixinBuilder with the base class
   * @param baseClass The base class
   */
  static mix(baseClass: Class<any>) {
    return new MixinBuilder(baseClass);
  }
}
