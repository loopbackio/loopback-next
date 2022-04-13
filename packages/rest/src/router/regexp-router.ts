// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {Key, pathToRegexp} from 'path-to-regexp';
import {inspect} from 'util';
import {RestBindings} from '../keys';
import {PathParameterValues} from '../types';
import {toExpressPath} from './openapi-path';
import {RestRouterOptions} from './rest-router';
import {createResolvedRoute, ResolvedRoute, RouteEntry} from './route-entry';
import {compareRoute} from './route-sort';
import {BaseRouter} from './router-base';

const debug = require('debug')('loopback:rest:router:regexp');

/**
 * Route entry with path-to-regexp
 */
interface RegExpRouteEntry extends RouteEntry {
  regexp: RegExp;
  keys: Key[];
}

/**
 * Router implementation based on regexp matching
 */
export class RegExpRouter extends BaseRouter {
  private routes: RegExpRouteEntry[] = [];

  // Sort the routes based on their paths and variables
  private _sorted: boolean;
  private _sort() {
    if (!this._sorted) {
      this.routes.sort(compareRoute);
      this._sorted = true;
    }
  }

  constructor(
    @inject(RestBindings.ROUTER_OPTIONS, {optional: true})
    options?: RestRouterOptions,
  ) {
    super(options);
  }

  protected addRouteWithPathVars(route: RouteEntry) {
    const path = toExpressPath(route.path);
    const keys: Key[] = [];
    const regexp = pathToRegexp(path, keys, {
      strict: this.options.strict,
      end: true,
    });
    const entry: RegExpRouteEntry = Object.assign(route, {keys, regexp});
    this.routes.push(entry);
    this._sorted = false;
  }

  protected findRouteWithPathVars(
    verb: string,
    path: string,
  ): ResolvedRoute | undefined {
    this._sort();
    for (const r of this.routes) {
      debug('trying endpoint %s', inspect(r, {depth: 5}));
      if (r.verb !== verb.toLowerCase()) {
        debug(' -> verb mismatch');
        continue;
      }

      const match = r.regexp.exec(path);
      if (!match) {
        debug(' -> path mismatch');
        continue;
      }

      const pathParams = this._buildPathParams(r, match);
      debug(' -> found with params: %j', pathParams);

      return createResolvedRoute(r, pathParams);
    }
    return undefined;
  }

  protected listRoutesWithPathVars() {
    this._sort();
    return this.routes;
  }

  private _buildPathParams(
    route: RegExpRouteEntry,
    pathMatch: RegExpExecArray,
  ): PathParameterValues {
    const pathParams: PathParameterValues = {};
    for (const ix in route.keys) {
      const key = route.keys[ix];
      const matchIndex = +ix + 1;
      pathParams[key.name] = pathMatch[matchIndex];
    }
    return pathParams;
  }
}
