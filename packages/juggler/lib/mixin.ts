/**
 * A constructor
 */
export type Constructor = new (...args: any[]) => Object;

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Constructor>(Base: BC): BC;
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


function extend(superClass: Constructor, ...mixins: Constructor[]): Constructor {
  const mixed = class extends superClass {
  };
  Object.assign(mixed, ...mixins);
  let prototypes: Constructor[] = mixins.map((c) => c.prototype);
  Object.assign(mixed.prototype, ...prototypes);
  return mixed;
}