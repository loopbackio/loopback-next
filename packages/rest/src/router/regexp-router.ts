// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RouteEntry, createResolvedRoute, ResolvedRoute} from './route-entry';
import {Request, PathParameterValues} from '../types';
import {inspect} from 'util';
import {compareRoute} from './route-sort';
import pathToRegExp = require('path-to-regexp');
import {BaseRouter} from './router-base';
import {toExpressPath} from './openapi-path';

const debug = require('debug')('loopback:rest:router:regexp');

/**
 * Route entry with path-to-regexp
 */
interface RegExpRouteEntry extends RouteEntry {
  regexp: RegExp;
  keys: pathToRegExp.Key[];
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

  protected addRouteWithPathVars(route: RouteEntry) {
    const path = toExpressPath(route.path);
    const keys: pathToRegExp.Key[] = [];
    const regexp = pathToRegExp(path, keys, {strict: false, end: true});
    const entry: RegExpRouteEntry = Object.assign(route, {keys, regexp});
    this.routes.push(entry);
    this._sorted = false;
  }

  protected findRouteWithPathVars(request: Request): ResolvedRoute | undefined {
    this._sort();
    for (const r of this.routes) {
      debug('trying endpoint %s', inspect(r, {depth: 5}));
      if (r.verb !== request.method.toLowerCase()) {
        debug(' -> verb mismatch');
        continue;
      }

      const match = r.regexp.exec(request.path);
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
