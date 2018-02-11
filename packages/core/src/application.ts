// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, Binding, BindingScope, Constructor} from '@loopback/context';
import {Server} from './server';
import {Component, mountComponent} from './component';
import {CoreBindings} from './keys';
import {Booter, BootOptions} from './booter';
import {BootExecutionOptions} from '../index';

/**
 * Application is the container for various types of artifacts, such as
 * components, servers, controllers, repositories, datasources, connectors,
 * and models.
 */
export class Application extends Context {
  constructor(public options?: ApplicationConfig) {
    super();
    if (!options) options = {};

    // Bind to self to allow injection of application context in other
    // modules.
    this.bind(CoreBindings.APPLICATION_INSTANCE).to(this);
    // Make options available to other modules as well.
    this.bind(CoreBindings.APPLICATION_CONFIG).to(options);
  }

  /**
   * Register a controller class with this application.
   *
   * @param {Function} controllerCtor The controller class
   * (constructor function)
   * @param {string=} name Optional controller name, default to the class name
   * @returns {Binding} The newly created binding, you can use the reference to
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
    name = name || controllerCtor.name;
    return this.bind(`${CoreBindings.CONTROLLERS_PREFIX}.${name}`)
      .toClass(controllerCtor)
      .tag(CoreBindings.CONTROLLERS_TAG);
  }

  /**
   * Register a booter class / array of classes with this application.
   *
   * @param {Function | Function[]} booterCls The booter class (constructor function).
   * @param {string=} name Optional booter name, defaults to the class name.
   * Ignored is cls is an Array and the name defaults to the class name.
   * @returns {Binding | Binding[]} The newly created binding(s), you can use the
   * reference to further modify the binding, e.g. lock the value to prevent
   * further modifications.
   *
   * ```ts
   * class MyBooter implements Booter {}
   * app.booter(MyBooter);
   * ```
   */
  booter(booterCls: Constructor<Booter>, name?: string): Binding;
  booter(booterCls: Constructor<Booter>[]): Binding[];
  booter(
    booterCls: Constructor<Booter> | Constructor<Booter>[],
    name?: string,
    // tslint:disable-next-line:no-any
  ): any {
    if (Array.isArray(booterCls)) {
      return booterCls.map(cls => this._bindBooter(cls));
    } else {
      return this._bindBooter(booterCls, name);
    }
  }

  /**
   *
   * @param booterCls A Booter Class
   * @param {string} name Name the Booter Class should be bound to
   * @returns {Binding} The newly created Binding
   */
  private _bindBooter<T extends Booter>(
    booterCls: Constructor<T>,
    name?: string,
  ): Binding {
    name = name || booterCls.name;
    return this.bind(`${CoreBindings.BOOTER_PREFIX}.${name}`)
      .toClass(booterCls)
      .inScope(BindingScope.CONTEXT)
      .tag(CoreBindings.BOOTER_TAG);
  }

  /**
   * Function is responsible for calling all registered Booter classes that
   * are bound to the Application instance. Each phase of an instance must
   * complete before the next phase is started.
   *
   * @param {BootExecutionOptions} execOptions Options to control the boot
   * process for the Application
   */
  async boot(execOptions?: BootExecutionOptions): Promise<void> {
    // Get a instance of the BootStrapper
    const bootstrapper = await this.get(CoreBindings.BOOTSTRAPPER, {
      optional: true,
    });
    // Since bootstrapper is optional, we check to see if instance was returned
    if (bootstrapper) {
      // this.options can never be undefined but TypeScript complains so we add
      // a check (and throw an error message just to be safe but it should never
      // be thrown).
      if (this.options) {
        await bootstrapper.boot(this.options.bootOptions, execOptions);
      } else {
        throw new Error(`Application.options need to be defined to use boot`);
      }
    } else {
      console.warn(`No bootstrapper was bound to ${CoreBindings.BOOTSTRAPPER}`);
    }
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
  ): Binding {
    const suffix = name || ctor.name;
    const key = `${CoreBindings.SERVERS}.${suffix}`;
    return this.bind(key)
      .toClass(ctor)
      .tag('server')
      .inScope(BindingScope.SINGLETON);
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
    target: Constructor<T> | String,
  ): Promise<T> {
    let key: string;
    // instanceof check not reliable for string.
    if (typeof target === 'string') {
      key = `${CoreBindings.SERVERS}.${target}`;
    } else {
      const ctor = target as Constructor<T>;
      key = `servers.${ctor.name}`;
    }
    return (await this.get(key)) as T;
  }

  /**
   * Start the application, and all of its registered servers.
   *
   * @returns {Promise}
   * @memberof Application
   */
  public async start(): Promise<void> {
    await this._forEachServer(s => s.start());
  }

  /**
   * Stop the application instance and all of its registered servers.
   * @returns {Promise}
   * @memberof Application
   */
  public async stop(): Promise<void> {
    await this._forEachServer(s => s.stop());
  }

  /**
   * Helper function for iterating across all registered server components.
   * @protected
   * @template T
   * @param {(s: Server) => Promise<T>} fn The function to run against all
   * registered servers
   * @memberof Application
   */
  protected async _forEachServer<T>(fn: (s: Server) => Promise<T>) {
    const bindings = this.find(`${CoreBindings.SERVERS}.*`);
    await Promise.all(
      bindings.map(async binding => {
        const server = (await this.get(binding.key)) as Server;
        return await fn(server);
      }),
    );
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
    name = name || componentCtor.name;
    const componentKey = `components.${name}`;
    this.bind(componentKey)
      .toClass(componentCtor)
      .inScope(BindingScope.SINGLETON)
      .tag('component');
    // Assuming components can be synchronously instantiated
    const instance = this.getSync(componentKey);
    mountComponent(this, instance);
  }
}

/**
 * Configuration for application
 */
export interface ApplicationConfig {
  /**
   * Boot Configuration
   */
  bootOptions?: BootOptions;
  /**
   * Other properties
   */
  // tslint:disable-next-line:no-any
  [prop: string]: any;
}

// tslint:disable-next-line:no-any
export type ControllerClass = Constructor<any>;
