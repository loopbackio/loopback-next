// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, Provider} from '@loopback/context';
import {Application} from '.';

// tslint:disable:no-any

export interface Component {
  controllers?: Constructor<any>[];
  providers?: {
    [key: string]: Constructor<Provider<any>>;
  };
}

export function mountComponent(
  app: Application,
  component: Component,
) {
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
}
