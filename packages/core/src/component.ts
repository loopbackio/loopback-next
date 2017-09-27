// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, Provider, BoundValue} from '@loopback/context';
import {Server, Application} from '.';

export interface ProviderMap {
  [key: string]: Constructor<Provider<BoundValue>>;
}

export interface Component {
  // tslint:disable-next-line:no-any
  controllers?: Constructor<any>[];
  providers?: ProviderMap;
  servers?: {
    [name: string]: Constructor<Server>;
  };

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
}
