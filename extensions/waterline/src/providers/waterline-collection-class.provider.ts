import {
  BindingScope,
  Constructor,
  createBindingFromClass,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {CollectionClass} from 'waterline';

/**
 * An abstract factory class that returns a
 * {@link waterline#CollectionClass | Waterline collection class}, and provides
 * helper functions for handling Waterline collection classes.
 *
 * @typeParam T - Type of Waterline collection class returned by the provider
 *
 * @remarks
 * An abstract factory is useful to enable direct binding of Waterline
 * collection classes into LoopBack 4's dependency injection system without
 * needing to modify the Waterline collection class itself. This mitigates
 * compatibility issues from changes in the upstream Waterline package, and
 * enables dynamic construction of the Waterline collection class during
 * resolution.
 *
 * Helper functions such as
 * {@link WaterlineModelProvider.createBindingFromClass | createBindingFromClass}
 * enables consistent handling of Waterline models within LoopBack 4
 * applications.
 *
 * @example
 * ```typescript
 * // `Model` is a direct re-export from the `waterline` package, and is
 * // synonymous to a `Collection`.
 * import {Model, ModelProvider} from '@loopback/waterline';
 *
 * export class MyModelProvider extends ModelProvider {
 *   value() {
 *     return Model.extend({});
 *   }
 * }
 * ```
 */
export abstract class CollectionClassProvider<
  T extends CollectionClass = CollectionClass
> implements Provider<T> {
  /**
   * Returns a {@link Binding} that has standardised defaults.
   *
   * @remarks
   * A default namepace and scope is applied to the bining. However, it can be
   * overriden by decorating the {@link ModelProvider} with
   * {@link @loopback/core#injectable | @injectable}.
   *
   * This function will honor explicitly-decorated binding configuration.
   *
   * @param cls - A {@link waterline#CollectionClass | Waterline collection class}
   * @returns - A {@link @loopback/core#Binding | Binding}
   */
  static createBindingFromCollectionClassProvider(
    cls: Constructor<CollectionClassProvider>,
  ) {
    return createBindingFromClass(cls, {
      defaultNamespace: 'waterlineModels',
      defaultScope: BindingScope.TRANSIENT,
    });
  }

  abstract value(): ValueOrPromise<T>;
}
