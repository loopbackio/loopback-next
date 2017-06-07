// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class, Any} from './common-types';

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Class<Any>>(baseClass: BC): BC;
}

/**
 * A builder to compose mixins
 */
export class MixinBuilder {
  constructor(public baseClass: Class<Any>) {
  }

  with(...mixins: MixinFunc[]) {
    return mixins.reduce((c, mixin) => mixin(c), this.baseClass);
  }

  static mix(baseClass: Class<Any>) {
    return new MixinBuilder(baseClass);
  }
}
