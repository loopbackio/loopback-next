// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, invokeMethodWithInterceptors} from '@loopback/core';
import {OperationObject} from '@loopback/openapi-v3';
import {RestBindings} from '../keys';
import {OperationArgs, OperationRetval} from '../types';
import {BaseRoute, RouteSource} from './base-route';

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
    return `${super.describe()} => ${
      this._handler.name || this._handler.toString()
    }`;
  }

  updateBindings(requestContext: Context) {
    requestContext.bind(RestBindings.OPERATION_SPEC_CURRENT).to(this.spec);
  }

  async invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    // Use `invokeMethodWithInterceptors` to invoke the handler function so
    // that global interceptors are applied
    return invokeMethodWithInterceptors(
      requestContext,
      this,
      '_handler',
      args,
      {source: new RouteSource(this)},
    );
  }
}
