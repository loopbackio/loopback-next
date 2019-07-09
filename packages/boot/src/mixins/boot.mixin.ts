// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
} from '@loopback/context';
import {BootComponent} from '../boot.component';
import {Bootstrapper} from '../bootstrapper';
import {BootBindings, BootTags} from '../keys';
import {Bootable, Booter, BootOptions} from '../types';

// Binding is re-exported as Binding / Booter types are needed when consuming
// BootMixin and this allows a user to import them from the same package (UX!)
export {Binding};

/**
 * Mixin for @loopback/boot. This Mixin provides the following:
 * - Implements the Bootable Interface as follows.
 * - Add a `projectRoot` property to the Class
 * - Adds an optional `bootOptions` property to the Class that can be used to
 *    store the Booter conventions.
 * - Adds the `BootComponent` to the Class (which binds the Bootstrapper and default Booters)
 * - Provides the `boot()` convenience method to call Bootstrapper.boot()
 * - Provides the `booter()` convenience method to bind a Booter(s) to the Application
 * - Override `component()` to call `mountComponentBooters`
 * - Adds `mountComponentBooters` which binds Booters to the application from `component.booters[]`
 *
 * ******************** NOTE ********************
 * Trying to constrain the type of this Mixin (or any Mixin) will cause errors.
 * For example, constraining this Mixin to type Application require all types using by
 * Application to be imported (including it's dependencies such as ResolutionSession).
 * Another issue was that if a Mixin that is type constrained is used with another Mixin
 * that is not, it will result in an error.
 * Example (class MyApp extends BootMixin(RepositoryMixin(Application))) {};
 ********************* END OF NOTE ********************
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BootMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass implements Bootable {
    projectRoot: string;
    bootOptions?: BootOptions;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.component(BootComponent);

      // We Dynamically bind the Project Root and Boot Options so these values can
      // be used to resolve an instance of the Bootstrapper (as they are dependencies)
      this.bind(BootBindings.PROJECT_ROOT).toDynamicValue(
        () => this.projectRoot,
      );
      this.bind(BootBindings.BOOT_OPTIONS).toDynamicValue(
        () => this.bootOptions,
      );
    }

    /**
     * Convenience method to call bootstrapper.boot() by resolving bootstrapper
     */
    async boot(): Promise<void> {
      // Get a instance of the BootStrapper
      const bootstrapper: Bootstrapper = await this.get(
        BootBindings.BOOTSTRAPPER_KEY,
      );

      await bootstrapper.boot();
    }

    /**
     * Given a N number of Booter Classes, this method binds them using the
     * prefix and tag expected by the Bootstrapper.
     *
     * @param booterCls - Booter classes to bind to the Application
     *
     * @example
     * ```ts
     * app.booters(MyBooter, MyOtherBooter)
     * ```
     */
    booters(...booterCls: Constructor<Booter>[]): Binding[] {
      return booterCls.map(cls =>
        _bindBooter((this as unknown) as Context, cls),
      );
    }

    /**
     * Override to ensure any Booter's on a Component are also mounted.
     *
     * @param component - The component to add.
     *
     * @example
     * ```ts
     *
     * export class ProductComponent {
     *   booters = [ControllerBooter, RepositoryBooter];
     *   providers = {
     *     [AUTHENTICATION_STRATEGY]: AuthStrategy,
     *     [AUTHORIZATION_ROLE]: Role,
     *   };
     * };
     *
     * app.component(ProductComponent);
     * ```
     */
    public component(component: Constructor<{}>) {
      super.component(component);
      this.mountComponentBooters(component);
    }

    /**
     * Get an instance of a component and mount all it's
     * booters. This function is intended to be used internally
     * by component()
     *
     * @param component - The component to mount booters of
     */
    mountComponentBooters(component: Constructor<{}>) {
      const componentKey = `components.${component.name}`;
      const compInstance = this.getSync(componentKey);

      if (compInstance.booters) {
        this.booters(...compInstance.booters);
      }
    }
  };
}

/**
 * Method which binds a given Booter to a given Context with the Prefix and
 * Tags expected by the Bootstrapper
 *
 * @param ctx - The Context to bind the Booter Class
 * @param booterCls - Booter class to be bound
 */
export function _bindBooter(
  ctx: Context,
  booterCls: Constructor<Booter>,
): Binding {
  const binding = createBindingFromClass(booterCls, {
    namespace: BootBindings.BOOTER_PREFIX,
    defaultScope: BindingScope.SINGLETON,
  }).tag(BootTags.BOOTER);
  ctx.add(binding);
  /**
   * Set up configuration binding as alias to `BootBindings.BOOT_OPTIONS`
   * so that the booter can use `@config`.
   */
  if (binding.tagMap.artifactNamespace) {
    ctx
      .configure(binding.key)
      .toAlias(
        `${BootBindings.BOOT_OPTIONS.key}#${binding.tagMap.artifactNamespace}`,
      );
  }
  return binding;
}
