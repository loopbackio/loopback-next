// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, invokeMethodWithInterceptors} from '@loopback/context';
import {OperationObject} from '@loopback/openapi-v3';
import {OperationArgs, OperationRetval} from '../types';
import {BaseRoute} from './base-route';

export class Route extends BaseRoute {
  constructor(
    verb: string,
    path: string,
    public readonly spec: OperationObject,
    protected readonly _handler: Function,
  ) {
    super(verb, path, spec);
  }

  describe(): string {
    return this._handler.name || super.describe();
  }

  updateBindings(requestContext: Context) {
    // no-op
  }

  async invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    // Use `invokeMethodWithInterceptors` to invoke the handler function so
    // that global interceptors are applied
    return invokeMethodWithInterceptors(requestContext, this, '_handler', args);
  }
}
