// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, Provider, BoundValue} from '@loopback/context';
import {Server} from './server';
import {Application, ControllerClass} from './application';
import {Booter} from './booter';

/**
 * A map of name/class pairs for binding providers
 */
export interface ProviderMap {
  [key: string]: Constructor<Provider<BoundValue>>;
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
  /**
   * An array of booter classes
   */
  booters?: Constructor<Booter>[];
  /**
   * A map of name/class pairs for servers
   */
  servers?: {
    [name: string]: Constructor<Server>;
  };

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
  if (component.controllers) {
    for (const controllerCtor of component.controllers) {
      app.controller(controllerCtor);
    }
  }

  if (component.providers) {
    for (const providerKey in component.providers) {
      app.bind(providerKey).toProvider(component.providers[providerKey]);
    }
  }

  if (component.servers) {
    for (const serverKey in component.servers) {
      app.server(component.servers[serverKey], serverKey);
    }
  }

  if (component.booters) {
    app.booter(component.booters);
  }
}
