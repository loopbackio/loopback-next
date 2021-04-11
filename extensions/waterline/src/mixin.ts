import {Application, Constructor, MixinTarget} from '@loopback/core';
import Waterline from 'waterline';
import {WaterlineBindings} from './keys';
import {CollectionClassProvider} from './providers/waterline-collection-class.provider';

export interface IWaterlineMixin {
  waterlineInstance: Waterline.Waterline;
  waterlineCollectionClass(
    model: Constructor<CollectionClassProvider>,
  ): Application;
}

/**
 *
 * @param baseClass - An application
 * @returns
 */
export function WaterlineMixin<T extends MixinTarget<Application>>(
  baseClass: T,
): T & Constructor<IWaterlineMixin> {
  return class WaterlineApplication extends baseClass {
    waterlineInstance: Waterline.Waterline;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.waterlineInstance = new Waterline();
      this.bind(WaterlineBindings.ORM_INSTANCE).to(this.waterlineInstance);
    }

    /**
     * Registers a
     * {@link waterline#CollectionClass | Waterline collection class}.
     *
     * @param model - A {@link CollectionClassProvider}
     *
     * @example Registering a Waterline model
     * ```typescript
     * import {Application} from '@loopback/core';
     * import {Model} from 'waterline';
     *
     * class WaterlineMixin<Application> {
     *   constructor() {
     *     waterlineModel(Model.extend());
     *   }
     * }
     * ```
     */
    waterlineCollectionClass(model: Constructor<CollectionClassProvider>) {
      return this.add(
        CollectionClassProvider.createBindingFromCollectionClassProvider(model),
      );
    }
  };
}
