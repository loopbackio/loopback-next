// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BoundValue,
  Constructor,
  createBindingFromClass,
  Provider,
} from '@loopback/context';
import {
  Application,
  ControllerClass,
  ServiceOrProviderClass,
} from './application';
import {LifeCycleObserver} from './lifecycle';
import {Server} from './server';

/**
 * A map of provider classes to be bound to a context
 */
export interface ProviderMap {
  [key: string]: Constructor<Provider<BoundValue>>;
}

/**
 * A map of classes to be bound to a context
 */
export interface ClassMap {
  [key: string]: Constructor<BoundValue>;
}

/**
 * A component declares a set of artifacts so that they can be contributed to
 * an application as a group
 */
export interface Component {
  /**
   * An array of controller classes
   */
  controllers?: ControllerClass[];

  /**
   * A map of providers to be bound to the application context
   *
   * @example
   * ```ts
   * {
   *   'authentication.strategies.ldap': LdapStrategyProvider
   * }
   * ```
   */
  providers?: ProviderMap;

  /**
   * A map of classes to be bound to the application context.
   *
   * @example
   * ```ts
   * {
   *   'rest.body-parsers.xml': XmlBodyParser
   * }
   * ```
   */
  classes?: ClassMap;

  /**
   * A map of name/class pairs for servers
   */
  servers?: {
    [name: string]: Constructor<Server>;
  };

  lifeCycleObservers?: Constructor<LifeCycleObserver>[];

  /**
   * An array of service or provider classes
   */
  services?: ServiceOrProviderClass[];

  /**
   * An array of bindings to be aded to the application context.
   *
   * @example
   * ```ts
   * const bindingX = Binding.bind('x').to('Value X');
   * this.bindings = [bindingX]
   * ```
   */
  bindings?: Binding[];

  /**
   * Other properties
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

/**
 * Mount a component to an Application.
 *
 * @param app - Application
 * @param component - Component instance
 */
export function mountComponent(app: Application, component: Component) {
  if (component.classes) {
    for (const classKey in component.classes) {
      const binding = createBindingFromClass(component.classes[classKey], {
        key: classKey,
      });
      app.add(binding);
    }
  }

  if (component.providers) {
    for (const providerKey in component.providers) {
      const binding = createBindingFromClass(component.providers[providerKey], {
        key: providerKey,
      });
      app.add(binding);
    }
  }

  if (component.bindings) {
    for (const binding of component.bindings) {
      app.add(binding);
    }
  }

  if (component.controllers) {
    for (const controllerCtor of component.controllers) {
      app.controller(controllerCtor);
    }
  }

  if (component.servers) {
    for (const serverKey in component.servers) {
      app.server(component.servers[serverKey], serverKey);
    }
  }

  if (component.lifeCycleObservers) {
    for (const observer of component.lifeCycleObservers) {
      app.lifeCycleObserver(observer);
    }
  }

  if (component.services) {
    for (const service of component.services) {
      app.service(service);
    }
  }
}
