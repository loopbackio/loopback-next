/**
 * A constructor
 */
export type Constructable = new (...args: any[]) => Object;

/**
 * Interface for functions that can mix properties/methods into a base class
 */
export interface MixinFunc {
  <BC extends Constructable>(Base: BC): BC;
}

export class MixinBuilder {
  constructor(public superclass) {
  }

  with(...mixins: MixinFunc[]) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }

  static mix(superClass) {
    return new MixinBuilder(superClass);
  }
}
