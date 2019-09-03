// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingScope,
  bindingTemplateFor,
  Constructor,
  Context,
  ContextTags,
  createBindingFromClass,
  isProviderClass,
  Provider,
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
  public readonly options: ApplicationConfig;

  /**
   * Create an application with the given parent context
   * @param parent - Parent context
   */
  constructor(parent: Context);
  /**
   * Create an application with the given configuration and parent context
   * @param config - Application configuration
   * @param parent - Parent context
   */
  constructor(config?: ApplicationConfig, parent?: Context);

  constructor(configOrParent?: ApplicationConfig | Context, parent?: Context) {
    super(
      configOrParent instanceof Context ? configOrParent : parent,
      'application',
    );

    if (configOrParent instanceof Context) configOrParent = {};
    this.options = configOrParent || {};

    // Bind the life cycle observer registry
    this.bind(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY)
      .toClass(LifeCycleObserverRegistry)
      .inScope(BindingScope.SINGLETON);
    // Bind to self to allow injection of application context in other modules.
    this.bind(CoreBindings.APPLICATION_INSTANCE).to(this);
    // Make options available to other modules as well.
    this.bind(CoreBindings.APPLICATION_CONFIG).to(this.options);
  }

  /**
   * Register a controller class with this application.
   *
   * @param controllerCtor - The controller class
   * (constructor function).
   * @param name - Optional controller name, default to the class name
   * @returns The newly created binding, you can use the reference to
   * further modify the binding, e.g. lock the value to prevent further
   * modifications.
   *
   * @example
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
   * @example
   * ```ts
   * app.server(RestServer);
   * // This server constructor will be bound under "servers.RestServer".
   * app.server(RestServer, "v1API");
   * // This server instance will be bound under "servers.v1API".
   * ```
   *
   * @param server - The server constructor.
   * @param name - Optional override for key name.
   * @returns Binding for the server class
   *
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
   * @remarks
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
   * @param ctors - An array of Server constructors.
   * @returns An array of bindings for the registered server classes
   *
   */
  public servers<T extends Server>(ctors: Constructor<T>[]): Binding[] {
    return ctors.map(ctor => this.server(ctor));
  }

  /**
   * Retrieve the singleton instance for a bound server.
   *
   * @typeParam T - Server type
   * @param ctor - The constructor that was used to make the
   * binding.
   * @returns A Promise of server instance
   *
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
    return this.get<T>(key);
  }

  /**
   * Start the application, and all of its registered observers.
   */
  public async start(): Promise<void> {
    const registry = await this.getLifeCycleObserverRegistry();
    await registry.start();
  }

  /**
   * Stop the application instance and all of its registered observers.
   */
  public async stop(): Promise<void> {
    const registry = await this.getLifeCycleObserverRegistry();
    await registry.stop();
  }

  private async getLifeCycleObserverRegistry() {
    return this.get(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY);
  }

  /**
   * Add a component to this application and register extensions such as
   * controllers, providers, and servers from the component.
   *
   * @param componentCtor - The component class to add.
   * @param name - Optional component name, default to the class name
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
   * @param metadata - Application metadata
   */
  public setMetadata(metadata: ApplicationMetadata) {
    this.bind(CoreBindings.APPLICATION_METADATA).to(metadata);
  }

  /**
   * Register a life cycle observer class
   * @param ctor - A class implements LifeCycleObserver
   * @param name - Optional name for the life cycle observer
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

  /**
   * Add a service to this application.
   *
   * @param cls - The service or provider class
   *
   * @example
   *
   * ```ts
   * // Define a class to be bound via ctx.toClass()
   * @bind({scope: BindingScope.SINGLETON})
   * export class LogService {
   *   log(msg: string) {
   *     console.log(msg);
   *   }
   * }
   *
   * // Define a class to be bound via ctx.toProvider()
   * const uuidv4 = require('uuid/v4');
   * export class UuidProvider implements Provider<string> {
   *   value() {
   *     return uuidv4();
   *   }
   * }
   *
   * // Register the local services
   * app.service(LogService);
   * app.service(UuidProvider, 'uuid');
   *
   * export class MyController {
   *   constructor(
   *     @inject('services.uuid') private uuid: string,
   *     @inject('services.LogService') private log: LogService,
   *   ) {
   *   }
   *
   *   greet(name: string) {
   *     this.log(`Greet request ${this.uuid} received: ${name}`);
   *     return `${this.uuid}: ${name}`;
   *   }
   * }
   * ```
   */
  public service<S>(
    cls: Constructor<S> | Constructor<Provider<S>>,
    name?: string,
  ): Binding<S> {
    if (!name && isProviderClass(cls)) {
      // Trim `Provider` from the default service name
      // This is needed to keep backward compatibility
      const templateFn = bindingTemplateFor(cls);
      const template = Binding.bind<S>('template').apply(templateFn);
      if (
        template.tagMap[ContextTags.PROVIDER] &&
        !template.tagMap[ContextTags.NAME]
      ) {
        // The class is a provider and no `name` tag is found
        name = cls.name.replace(/Provider$/, '');
      }
    }
    const binding = createBindingFromClass(cls, {
      name,
      type: 'service',
    });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
