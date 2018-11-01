// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {OperationObject} from '@loopback/openapi-v3-types';
import {OperationArgs, OperationRetval} from '../types';
import {RouteEntry} from './route-entry';

/**
 * Base implementation of RouteEntry
 */
export abstract class BaseRoute implements RouteEntry {
  public readonly verb: string;

  /**
   * Construct a new route
   * @param verb http verb
   * @param path http request path pattern
   * @param spec OpenAPI operation spec
   */
  constructor(
    verb: string,
    public readonly path: string,
    public readonly spec: OperationObject,
  ) {
    this.verb = verb.toLowerCase();
  }

  abstract updateBindings(requestContext: Context): void;

  abstract invokeHandler(
    requestContext: Context,
    args: OperationArgs,
  ): Promise<OperationRetval>;

  describe(): string {
    return `"${this.verb} ${this.path}"`;
  }
}
