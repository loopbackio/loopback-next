// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingFilter,
  BindingFromClassOptions,
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
  Application,
  Component,
  CoreBindings,
  MixinTarget,
} from '@loopback/core';
import {BootComponent} from '../boot.component';
import {createComponentApplicationBooterBinding} from '../booters/component-application.booter';
import {Bootstrapper} from '../bootstrapper';
import {BootBindings, BootTags} from '../keys';
import {Bootable, Booter, BootOptions, InstanceWithBooters} from '../types';

// FIXME(rfeng): Workaround for https://github.com/microsoft/rushstack/pull/1867
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as loopbackContext from '@loopback/core';
import * as loopbackCore from '@loopback/core';
/* eslint-enable @typescript-eslint/no-unused-vars */

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
 * @param superClass - Application class
 * @returns A new class that extends the super class with boot related methods
 *
 * @typeParam T - Type of the application class as the target for the mixin
 */
export function BootMixin<T extends MixinTarget<Application>>(superClass: T) {
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
        () => this.bootOptions ?? {},
      );
    }

    booted: boolean;

    /**
     * Override to detect and warn about starting without booting.
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public async start(): Promise<void> {
      await super.start();
      if (!this.booted) {
        process.emitWarning(
          'App started without booting. Did you forget to call ' +
            '`await app.boot()`?',
          'LoopBackWarning',
        );
      }
    }

    /**
     * Convenience method to call bootstrapper.boot() by resolving bootstrapper
     */
    async boot(): Promise<void> {
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // A workaround to access protected Application methods
      const self = this as unknown as Application;

      if (this.state === 'booting') {
        // @ts-ignore
        return self.awaitState('booted');
      }
      // @ts-ignore
      self.assertNotInProcess('boot');
      // @ts-ignore
      self.assertInStates('boot', 'created', 'booted');

      if (this.state === 'booted') return;
      // @ts-ignore
      self.setState('booting');

      // Get a instance of the BootStrapper
      const bootstrapper: Bootstrapper = await this.get(
        BootBindings.BOOTSTRAPPER_KEY,
      );

      await bootstrapper.boot();

      // @ts-ignore
      this.setState('booted');
      this.booted = true;

      /* eslint-enable @typescript-eslint/ban-ts-comment */
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
      return booterCls.map(cls => bindBooter(this as unknown as Context, cls));
    }

    /**
     * Register a booter to boot a sub-application. See
     * {@link createComponentApplicationBooterBinding} for more details.
     *
     * @param subApp - A sub-application with artifacts to be booted
     * @param filter - A binding filter to select what bindings from the sub
     * application should be added to the main application.
     */
    applicationBooter(subApp: Application & Bootable, filter?: BindingFilter) {
      const binding = createComponentApplicationBooterBinding(subApp, filter);
      this.add(binding);
      return binding;
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
    // Unfortunately, TypeScript does not allow overriding methods inherited
    // from mapped types. https://github.com/microsoft/TypeScript/issues/38496
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public component<C extends Component = Component>(
      componentCtor: Constructor<C>,
      nameOrOptions?: string | BindingFromClassOptions,
    ) {
      const binding = super.component(componentCtor, nameOrOptions);
      const instance = this.getSync<InstanceWithBooters>(binding.key);

      this.mountComponentBooters(instance);
      return binding;
    }

    /**
     * Get an instance of a component and mount all it's
     * booters. This function is intended to be used internally
     * by component()
     *
     * @param component - The component to mount booters of
     */
    mountComponentBooters(
      componentInstanceOrClass: Constructor<unknown> | InstanceWithBooters,
    ) {
      const componentInstance = resolveComponentInstance(this);
      if (componentInstance.booters) {
        this.booters(...componentInstance.booters);
      }

      /**
       * Determines if componentInstanceOrClass is an instance of a component,
       * or a class that needs to be instantiated from context.
       * @param ctx
       */
      function resolveComponentInstance(ctx: Readonly<Context>) {
        if (typeof componentInstanceOrClass !== 'function') {
          return componentInstanceOrClass;
        }

        // TODO(semver-major) @bajtos: Reminder to remove this on the next major release
        const componentName = componentInstanceOrClass.name;
        const componentKey = `${CoreBindings.COMPONENTS}.${componentName}`;
        return ctx.getSync<InstanceWithBooters>(componentKey);
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
export function bindBooter(
  ctx: Context,
  booterCls: Constructor<Booter>,
): Binding {
  const binding = createBindingFromClass(booterCls, {
    namespace: BootBindings.BOOTERS,
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const _bindBooter = bindBooter; // For backward-compatibility
