// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class, AnyType} from './common';

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Class<{}>>(baseClass: BC): BC;
}

export class MixinBuilder {
  constructor(public baseClass: Class<AnyType>) {
  }

  with(...mixins: MixinFunc[]) {
    return mixins.reduce((c, mixin) => mixin(c), this.baseClass);
  }

  static mix(baseClass: Class<AnyType>) {
    return new MixinBuilder(baseClass);
  }
}


function extend<T extends Class<{}>>(superClass: T, ...mixins: Class<{}>[]): T {
  const mixed = class extends superClass {
  };
  Object.assign(mixed, ...mixins);
  const prototypes: Class<{}>[] = mixins.map((c) => c.prototype);
  Object.assign(mixed.prototype, ...prototypes);
  return mixed;
}
