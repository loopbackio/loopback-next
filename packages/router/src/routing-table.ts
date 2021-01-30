// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/router
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ControllerClass} from '@loopback/core';
import {ControllerFactory} from './controller-route';
import {RouteEntry} from './entry.route';

export interface RoutingTable<S, P, A, R> {
  registerController<T>(
    spec: S,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
  ): Promise<void>;

  registerRoute(route: RouteEntry<P, A, R>): Promise<void>;
}
