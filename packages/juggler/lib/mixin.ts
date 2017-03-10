/**
 * A constructor
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Constructor<{}>>(Base: BC): BC;
}

export class MixinBuilder {
  constructor(public baseClass) {
  }

  with(...mixins: MixinFunc[]) {
    return mixins.reduce((c, mixin) => mixin(c), this.baseClass);
  }

  static mix(baseClass) {
    return new MixinBuilder(baseClass);
  }
}


function extend<T extends Constructor<{}>>(superClass: T, ...mixins: Constructor<{}>[]): T {
  const mixed = class extends superClass {
  };
  Object.assign(mixed, ...mixins);
  let prototypes: Constructor<{}>[] = mixins.map((c) => c.prototype);
  Object.assign(mixed.prototype, ...prototypes);
  return mixed;
}