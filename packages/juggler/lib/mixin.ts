/**
 * A constructor
 */
export type Constructable = new (...args: any[]) => Object;

/**
 * Interface for mixin providers
 */
export interface MixinProvider {
  /**
   * Mix in properties/methods into a base class
   * @param Base The base class
   */
  mixin<BC extends Constructable>(Base: BC): BC;
}

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Constructable>(Base: BC): BC;
}

function mixin(superclass: Constructable) {
  return class extends superclass {
  };
};

export class MixinBuilder {
  constructor(public superclass) {
  }

  with(...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }

  static mix(superClass) {
    return new MixinBuilder(superClass);
  }
}
