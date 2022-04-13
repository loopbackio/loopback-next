// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
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
    public readonly sourcePath: string,
    public readonly targetLocation: string,
    public readonly statusCode: number = 303,
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
    return `Redirect: "${this.sourcePath}" => "${this.targetLocation}"`;
  }

  /**
   * type guard type checker for this class
   * @param obj
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isRedirectRoute(obj: any): obj is RedirectRoute {
    const redirectOptions = obj as RedirectRoute;
    if (
      redirectOptions?.targetLocation &&
      redirectOptions.spec?.description === 'LoopBack Redirect route'
    ) {
      return true;
    }
    return false;
  }
}
