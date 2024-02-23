// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingAddress,
  BindingFromClassOptions,
  Component,
  Constructor,
  MixinTarget,
  Provider,
  ServiceOptions,
} from '@loopback/core';

/**
 * Interface for classes with `new` operator.
 */
export interface Class<T> {
  // new MyClass(...args) ==> T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
}

/**
 * A mixin class for Application that creates a .serviceProvider()
 * function to register a service automatically. Also overrides
 * component function to allow it to register repositories automatically.
 *
 * @example
 * ```ts
 * class MyApplication extends ServiceMixin(Application) {}
 * ```
 *
 * Please note: the members in the mixin function are documented in a dummy class
 * called <a href="#ServiceMixinDoc">ServiceMixinDoc</a>
 *
 * @param superClass - Application class
 * @returns A new class that extends the super class with service proxy related
 * methods
 *
 * @typeParam T - Type of the application class as the target for the mixin
 */
export function ServiceMixin<T extends MixinTarget<Application>>(
  superClass: T,
) {
  return class extends superClass {
    /**
     * Add a service to this application.
     *
     * @deprecated Use app.service() instead
     *
     * @param provider - The service provider to register.
     *
     * @example
     * ```ts
     * export interface GeocoderService {
     *   geocode(address: string): Promise<GeoPoint[]>;
     * }
     *
     * export class GeocoderServiceProvider implements Provider<GeocoderService> {
     *   constructor(
     *     @inject('services.geocoder')
     *     protected dataSource: juggler.DataSource = new GeocoderDataSource(),
     *   ) {}
     *
     *   value(): Promise<GeocoderService> {
     *     return getService(this.dataSource);
     *   }
     * }
     *
     * app.serviceProvider(GeocoderServiceProvider);
     * ```
     */
    serviceProvider<S>(
      provider: Constructor<Provider<S>>,
      nameOrOptions?: string | ServiceOptions,
    ): Binding<S> {
      return this.service(provider, nameOrOptions);
    }

    /**
     * Add a component to this application. Also mounts
     * all the components services.
     *
     * @param component - The component to add.
     *
     * @example
     * ```ts
     *
     * export class ProductComponent {
     *   controllers = [ProductController];
     *   repositories = [ProductRepo, UserRepo];
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
    component<C extends Component = Component>(
      componentCtor: Constructor<C>,
      nameOrOptions?: string | BindingFromClassOptions,
    ) {
      const binding = super.component(componentCtor, nameOrOptions);
      this.mountComponentServices(componentCtor, binding.key);
      return binding;
    }

    /**
     * Get an instance of a component and mount all it's
     * services. This function is intended to be used internally
     * by component()
     *
     * @param component - The component to mount services of
     */
    mountComponentServices<C extends Component = Component>(
      component: Constructor<C>,
      componentBindingKey?: BindingAddress<C>,
    ) {
      const componentKey =
        componentBindingKey ?? `components.${component.name}`;
      const compInstance = this.getSync<Component>(componentKey);

      if (compInstance.serviceProviders) {
        for (const provider of compInstance.serviceProviders) {
          this.serviceProvider(provider);
        }
      }
    }
  };
}

/**
 * Interface for an Application mixed in with ServiceMixin
 */
export interface ApplicationWithServices extends Application {
  serviceProvider<S>(
    provider: Constructor<Provider<S>>,
    name?: string,
  ): Binding<S>;
  component(component: Constructor<{}>, name?: string): Binding;
  mountComponentServices(component: Constructor<{}>): void;
}

/**
 * A dummy class created to generate the tsdoc for the members in service
 * mixin. Please don't use it.
 *
 * The members are implemented in function
 * <a href="#ServiceMixin">ServiceMixin</a>
 */
export class ServiceMixinDoc {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]) {
    throw new Error(
      'This is a dummy class created for apidoc! Please do not use it!',
    );
  }

  /**
   * Add a service to this application.
   *
   * @param provider - The service provider to register.
   *
   * @example
   * ```ts
   * export interface GeocoderService {
   *   geocode(address: string): Promise<GeoPoint[]>;
   * }
   *
   * export class GeocoderServiceProvider implements Provider<GeocoderService> {
   *   constructor(
   *     @inject('datasources.geocoder')
   *     protected dataSource: juggler.DataSource = new GeocoderDataSource(),
   *   ) {}
   *
   *   value(): Promise<GeocoderService> {
   *     return getService(this.dataSource);
   *   }
   * }
   *
   * app.serviceProvider(GeocoderServiceProvider);
   * ```
   */
  serviceProvider<S>(provider: Constructor<Provider<S>>): Binding<S> {
    throw new Error();
  }

  /**
   * Add a component to this application. Also mounts
   * all the components services.
   *
   * @param component - The component to add.
   *
   * @example
   * ```ts
   *
   * export class ProductComponent {
   *   controllers = [ProductController];
   *   repositories = [ProductRepo, UserRepo];
   *   providers = {
   *     [AUTHENTICATION_STRATEGY]: AuthStrategy,
   *     [AUTHORIZATION_ROLE]: Role,
   *   };
   * };
   *
   * app.component(ProductComponent);
   * ```
   */
  public component(component: Constructor<unknown>): Binding {
    throw new Error();
  }

  /**
   * Get an instance of a component and mount all it's
   * services. This function is intended to be used internally
   * by component()
   *
   * @param component - The component to mount services of
   */
  mountComponentServices(component: Constructor<unknown>) {}
}
