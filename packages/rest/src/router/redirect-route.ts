// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OperationObject, SchemasObject} from '@loopback/openapi-v3';
import {ResolvedRoute, RouteEntry} from '.';
import {RequestContext} from '../request-context';
import {OperationArgs, OperationRetval, PathParameterValues} from '../types';

export class RedirectRoute implements RouteEntry, ResolvedRoute {
  // ResolvedRoute API
  readonly pathParams: PathParameterValues = [];
  readonly schemas: SchemasObject = {};

  // RouteEntry implementation
  readonly verb: string = 'get';
  readonly path: string;
  readonly spec: OperationObject = {
    description: 'LoopBack Redirect route',
    'x-visibility': 'undocumented',
    responses: {},
  };

  constructor(
    private readonly sourcePath: string,
    private readonly targetLocation: string,
    private readonly statusCode: number = 303,
  ) {
    this.path = sourcePath;
  }

  async invokeHandler(
    {response}: RequestContext,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    response.redirect(this.statusCode, this.targetLocation);
  }

  updateBindings(requestContext: RequestContext) {
    // no-op
  }

  describe(): string {
    return `RedirectRoute from "${this.sourcePath}" to "${this.targetLocation}"`;
  }
}
