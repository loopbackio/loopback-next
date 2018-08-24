// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/context';
import {Application} from '@loopback/core';

/**
 * Interface for classes with `new` operator.
 */
export interface Class<T> {
  // new MyClass(...args) ==> T
  // tslint:disable-next-line:no-any
  new (...args: any[]): T;
}

/**
 * A mixin class for Application that creates a .serviceProvider()
 * function to register a service automatically. Also overrides
 * component function to allow it to register repositories automatically.
 *
 * ```ts
 * class MyApplication extends ServiceMixin(Application) {}
 * ```
 *
 * Please note: the members in the mixin function are documented in a dummy class
 * called <a href="#ServiceMixinDoc">ServiceMixinDoc</a>
 *
 */
// tslint:disable-next-line:no-any
export function ServiceMixin<T extends Class<any>>(superClass: T) {
  return class extends superClass {
    // A mixin class has to take in a type any[] argument!
    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Add a service to this application.
     *
     * @param provider The service provider to register.
     *
     * ```ts
     * export interface GeocoderService {
     *   geocode(address: string): Promise<GeoPoint[]>;
     * }
     *
     * export class GeocoderServiceProvider implements Provider<GeocoderService> {
     *   constructor(
     *     @inject('datasources.geocoder')
     *     protected datasource: juggler.DataSource = new GeocoderDataSource(),
     *   ) {}
     *
     *   value(): Promise<GeocoderService> {
     *     return getService(this.datasource);
     *   }
     * }
     *
     * app.serviceProvider(GeocoderServiceProvider);
     * ```
     */
    serviceProvider<S>(provider: Class<Provider<S>>): void {
      const serviceName = provider.name.replace(/Provider$/, '');
      const repoKey = `services.${serviceName}`;
      this.bind(repoKey)
        .toProvider(provider)
        .tag('service');
    }

    /**
     * Add a component to this application. Also mounts
     * all the components services.
     *
     * @param component The component to add.
     *
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
    public component(component: Class<{}>) {
      super.component(component);
      this.mountComponentServices(component);
    }

    /**
     * Get an instance of a component and mount all it's
     * services. This function is intended to be used internally
     * by component()
     *
     * @param component The component to mount services of
     */
    mountComponentServices(component: Class<{}>) {
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
  // tslint:disable-next-line:no-any
  serviceProvider<S>(provider: Class<Provider<S>>): void;
  component(component: Class<{}>): void;
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
  // tslint:disable-next-line:no-any
  constructor(...args: any[]) {
    throw new Error(
      'This is a dummy class created for apidoc! Please do not use it!',
    );
  }

  /**
   * Add a service to this application.
   *
   * @param provider The service provider to register.
   *
   * ```ts
   * export interface GeocoderService {
   *   geocode(address: string): Promise<GeoPoint[]>;
   * }
   *
   * export class GeocoderServiceProvider implements Provider<GeocoderService> {
   *   constructor(
   *     @inject('datasources.geocoder')
   *     protected datasource: juggler.DataSource = new GeocoderDataSource(),
   *   ) {}
   *
   *   value(): Promise<GeocoderService> {
   *     return getService(this.datasource);
   *   }
   * }
   *
   * app.serviceProvider(GeocoderServiceProvider);
   * ```
   */
  serviceProvider<S>(provider: Class<Provider<S>>): void {}

  /**
   * Add a component to this application. Also mounts
   * all the components services.
   *
   * @param component The component to add.
   *
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
  public component(component: Class<{}>) {}

  /**
   * Get an instance of a component and mount all it's
   * services. This function is intended to be used internally
   * by component()
   *
   * @param component The component to mount services of
   */
  mountComponentServices(component: Class<{}>) {}
}
