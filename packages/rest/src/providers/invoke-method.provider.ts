// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {InvokeMethod, OperationArgs, OperationRetval} from '../types';
import {RestBindings} from '../keys';
import {RouteEntry} from '../router/routing-table';

export class InvokeMethodProvider implements Provider<InvokeMethod> {
  constructor(@inject(RestBindings.Http.CONTEXT) protected context: Context) {}

  value(): InvokeMethod {
    return (route, args) => this.action(route, args);
  }

  action(route: RouteEntry, args: OperationArgs): Promise<OperationRetval> {
    return route.invokeHandler(this.context, args);
  }
}
