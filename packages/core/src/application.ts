// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
} from '@loopback/context';
import * as debugFactory from 'debug';
import {Component, mountComponent} from './component';
import {CoreBindings, CoreTags} from './keys';
import {
  asLifeCycleObserver,
  isLifeCycleObserverClass,
  LifeCycleObserver,
} from './lifecycle';
import {LifeCycleObserverRegistry} from './lifecycle-registry';
import {Server} from './server';
const debug = debugFactory('loopback:core:application');

/**
 * Application is the container for various types of artifacts, such as
 * components, servers, controllers, repositories, datasources, connectors,
 * and models.
 */
export class Application extends Context implements LifeCycleObserver {
  constructor(public options: ApplicationConfig = {}) {
    super('application');

    // Bind the life cycle observer registry
    this.bind(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY)
      .toClass(LifeCycleObserverRegistry)
      .inScope(BindingScope.SINGLETON);
    // Bind to self to allow injection of application context in other modules.
    this.bind(CoreBindings.APPLICATION_INSTANCE).to(this);
    // Make options available to other modules as well.
    this.bind(CoreBindings.APPLICATION_CONFIG).to(options);
  }

  /**
   * Register a controller class with this application.
   *
   * @param controllerCtor {Function} The controller class
   * (constructor function).
   * @param {string=} name Optional controller name, default to the class name
   * @return {Binding} The newly created binding, you can use the reference to
   * further modify the binding, e.g. lock the value to prevent further
   * modifications.
   *
   * ```ts
   * class MyController {
   * }
   * app.controller(MyController).lock();
   * ```
   */
  controller(controllerCtor: ControllerClass, name?: string): Binding {
    debug('Adding controller %s', name || controllerCtor.name);
    const binding = createBindingFromClass(controllerCtor, {
      name,
      namespace: CoreBindings.CONTROLLERS,
      type: CoreTags.CONTROLLER,
      defaultScope: BindingScope.TRANSIENT,
    });
    this.add(binding);
    return binding;
  }

  /**
   * Bind a Server constructor to the Application's master context.
   * Each server constructor added in this way must provide a unique prefix
   * to prevent binding overlap.
   *
   * ```ts
   * app.server(RestServer);
   * // This server constructor will be bound under "servers.RestServer".
   * app.server(RestServer, "v1API");
   * // This server instance will be bound under "servers.v1API".
   * ```
   *
   * @param {Constructor<Server>} server The server constructor.
   * @param {string=} name Optional override for key name.
   * @returns {Binding} Binding for the server class
   * @memberof Application
   */
  public server<T extends Server>(
    ctor: Constructor<T>,
    name?: string,
  ): Binding<T> {
    debug('Adding server %s', name || ctor.name);
    const binding = createBindingFromClass(ctor, {
      name,
      namespace: CoreBindings.SERVERS,
      type: CoreTags.SERVER,
      defaultScope: BindingScope.SINGLETON,
    }).apply(asLifeCycleObserver);
    this.add(binding);
    return binding;
  }

  /**
   * Bind an array of Server constructors to the Application's master
   * context.
   * Each server added in this way will automatically be named based on the
   * class constructor name with the "servers." prefix.
   *
   * If you wish to control the binding keys for particular server instances,
   * use the app.server function instead.
   * ```ts
   * app.servers([
   *  RestServer,
   *  GRPCServer,
   * ]);
   * // Creates a binding for "servers.RestServer" and a binding for
   * // "servers.GRPCServer";
   * ```
   *
   * @param {Constructor<Server>[]} ctors An array of Server constructors.
   * @returns {Binding[]} An array of bindings for the registered server classes
   * @memberof Application
   */
  public servers<T extends Server>(ctors: Constructor<T>[]): Binding[] {
    return ctors.map(ctor => this.server(ctor));
  }

  /**
   * Retrieve the singleton instance for a bound constructor.
   *
   * @template T
   * @param {Constructor<T>=} ctor The constructor that was used to make the
   * binding.
   * @returns {Promise<T>}
   * @memberof Application
   */
  public async getServer<T extends Server>(
    target: Constructor<T> | string,
  ): Promise<T> {
    let key: string;
    // instanceof check not reliable for string.
    if (typeof target === 'string') {
      key = `${CoreBindings.SERVERS}.${target}`;
    } else {
      const ctor = target as Constructor<T>;
      key = `${CoreBindings.SERVERS}.${ctor.name}`;
    }
    return await this.get<T>(key);
  }

  /**
   * Start the application, and all of its registered observers.
   *
   * @returns {Promise}
   * @memberof Application
   */
  public async start(): Promise<void> {
    const registry = await this.getLifeCycleObserverRegistry();
    await registry.start();
  }

  /**
   * Stop the application instance and all of its registered observers.
   * @returns {Promise}
   * @memberof Application
   */
  public async stop(): Promise<void> {
    const registry = await this.getLifeCycleObserverRegistry();
    await registry.stop();
  }

  private async getLifeCycleObserverRegistry() {
    return await this.get(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY);
  }

  /**
   * Add a component to this application and register extensions such as
   * controllers, providers, and servers from the component.
   *
   * @param componentCtor The component class to add.
   * @param {string=} name Optional component name, default to the class name
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
  public component(componentCtor: Constructor<Component>, name?: string) {
    debug('Adding component: %s', name || componentCtor.name);
    const binding = createBindingFromClass(componentCtor, {
      name,
      namespace: CoreBindings.COMPONENTS,
      type: CoreTags.COMPONENT,
      defaultScope: BindingScope.SINGLETON,
    });
    if (isLifeCycleObserverClass(componentCtor)) {
      binding.apply(asLifeCycleObserver);
    }
    this.add(binding);
    // Assuming components can be synchronously instantiated
    const instance = this.getSync<Component>(binding.key);
    mountComponent(this, instance);
    return binding;
  }

  /**
   * Set application metadata. `@loopback/boot` calls this method to populate
   * the metadata from `package.json`.
   *
   * @param metadata Application metadata
   */
  public setMetadata(metadata: ApplicationMetadata) {
    this.bind(CoreBindings.APPLICATION_METADATA).to(metadata);
  }

  /**
   * Register a life cycle observer class
   * @param ctor A class implements LifeCycleObserver
   * @param name Optional name for the life cycle observer
   */
  public lifeCycleObserver<T extends LifeCycleObserver>(
    ctor: Constructor<T>,
    name?: string,
  ): Binding<T> {
    debug('Adding life cycle observer %s', name || ctor.name);
    const binding = createBindingFromClass(ctor, {
      name,
      namespace: CoreBindings.LIFE_CYCLE_OBSERVERS,
      type: CoreTags.LIFE_CYCLE_OBSERVER,
      defaultScope: BindingScope.SINGLETON,
    }).apply(asLifeCycleObserver);
    this.add(binding);
    return binding;
  }
}

/**
 * Configuration for application
 */
export interface ApplicationConfig {
  /**
   * Other properties
   */
  // tslint:disable-next-line:no-any
  [prop: string]: any;
}

// tslint:disable-next-line:no-any
export type ControllerClass = Constructor<any>;

/**
 * Type definition for JSON
 */
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export interface JSONObject {
  [property: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}

/**
 * Type description for `package.json`
 */
export interface ApplicationMetadata extends JSONObject {
  name: string;
  version: string;
  description: string;
}
