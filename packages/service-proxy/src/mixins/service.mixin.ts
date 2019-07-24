// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Provider} from '@loopback/context';
import {Application} from '@loopback/core';

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
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ServiceMixin<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    // A mixin class has to take in a type any[] argument!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

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
      provider: Class<Provider<S>>,
      name?: string,
    ): Binding<S> {
      return this.service(provider, name);
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
    public component(component: Class<unknown>, name?: string) {
      super.component(component, name);
      this.mountComponentServices(component);
    }

    /**
     * Get an instance of a component and mount all it's
     * services. This function is intended to be used internally
     * by component()
     *
     * @param component - The component to mount services of
     */
    mountComponentServices(component: Class<unknown>) {
      const componentKey = `components.${component.name}`;
      const compInstance = this.getSync(componentKey);

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
  serviceProvider<S>(provider: Class<Provider<S>>, name?: string): Binding<S>;
  component(component: Class<{}>, name?: string): Binding;
  mountComponentServices(component: Class<{}>): void;
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
  serviceProvider<S>(provider: Class<Provider<S>>): Binding<S> {
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
  public component(component: Class<unknown>): Binding {
    throw new Error();
  }

  /**
   * Get an instance of a component and mount all it's
   * services. This function is intended to be used internally
   * by component()
   *
   * @param component - The component to mount services of
   */
  mountComponentServices(component: Class<unknown>) {}
}
