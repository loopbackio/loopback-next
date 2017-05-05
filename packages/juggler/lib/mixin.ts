import {Class} from './common';

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Class<{}>>(Base: BC): BC;
}

export class MixinBuilder {
  constructor(public baseClass: Class<any>) {
  }

  with(...mixins: MixinFunc[]) {
    return mixins.reduce((c, mixin) => mixin(c), this.baseClass);
  }

  static mix(baseClass: Class<any>) {
    return new MixinBuilder(baseClass);
  }
}


function extend<T extends Class<{}>>(superClass: T, ...mixins: Class<{}>[]): T {
  const mixed = class extends superClass {
  };
  Object.assign(mixed, ...mixins);
  let prototypes: Class<{}>[] = mixins.map((c) => c.prototype);
  Object.assign(mixed.prototype, ...prototypes);
  return mixed;
}
