// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, Provider, BoundValue, Binding} from '@loopback/context';
import {Server} from './server';
import {Application, ControllerClass} from './application';

/**
 * A map of name/class pairs for binding providers
 */
export interface ProviderMap {
  [key: string]: Constructor<Provider<BoundValue>>;
}

export interface ClassMap {
  [key: string]: Constructor<BoundValue>;
}

/**
 * A component declares a set of artifacts so that they cane be contributed to
 * an application as a group
 */
export interface Component {
  /**
   * An array of controller classes
   */
  controllers?: ControllerClass[];
  /**
   * A map of name/class pairs for binding providers
   */
  providers?: ProviderMap;

  classes?: ClassMap;

  /**
   * A map of name/class pairs for servers
   */
  servers?: {
    [name: string]: Constructor<Server>;
  };

  /**
   * An array of bindings
   */
  bindings?: Binding[];

  /**
   * Other properties
   */
  // tslint:disable-next-line:no-any
  [prop: string]: any;
}

/**
 * Mount a component to an Application.
 *
 * @export
 * @param {Application} app
 * @param {Component} component
 */
export function mountComponent(app: Application, component: Component) {
  if (component.classes) {
    for (const classKey in component.classes) {
      const binding = Binding.bind(classKey).toClass(
        component.classes[classKey],
      );
      app.add(binding);
    }
  }

  if (component.providers) {
    for (const providerKey in component.providers) {
      const binding = Binding.bind(providerKey).toProvider(
        component.providers[providerKey],
      );
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
}
