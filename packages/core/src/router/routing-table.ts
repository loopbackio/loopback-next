// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  OpenApiSpec,
  OperationObject,
  ParameterObject,
} from '@loopback/openapi-spec';
import {ServerRequest} from 'http';

import {ParsedRequest, PathParameterValues} from '../internal-types';

import * as assert from 'assert';
import * as url from 'url';
const debug = require('debug')('loopback:core:routing-table');

// TODO(bajtos) Refactor this code to use Trie-based lookup,
// e.g. via wayfarer/trie or find-my-way
import * as pathToRegexp from 'path-to-regexp';

/**
 * Parse the URL of the incoming request and set additional properties
 * on this request object:
 *  - `path`
 *  - `query`
 *
 * @private
 * @param request
 */
export function parseRequestUrl(request: ServerRequest): ParsedRequest {
  // TODO(bajtos) The following parsing can be skipped when the router
  // is mounted on an express app
  const parsedRequest = request as ParsedRequest;
  const parsedUrl = url.parse(parsedRequest.url, true);
  parsedRequest.path = parsedUrl.pathname || '/';
  parsedRequest.query = parsedUrl.query;
  return parsedRequest;
}

export class RoutingTable {
  private readonly _routes: Route[] = [];

  registerController(controller: string, spec: OpenApiSpec) {
    assert(
      typeof spec === 'object' && !!spec,
      'API specification must be a non-null object',
    );
    if (!spec.paths || !Object.keys(spec.paths).length) {
      return;
    }

    debug('Registering Controller with API', spec);

    for (const path in spec.paths) {
      for (const verb in spec.paths[path]) {
        const opSpec: OperationObject = spec.paths[path][verb];
        // TODO(bajtos) handle the case where opSpec.parameters contains $ref
        debug(
          '  %s %s -> %s(%s)',
          verb,
          path,
          opSpec['x-operation-name'],
          describeOperationParameters(opSpec),
        );
        this._routes.push(new Route(verb, path, opSpec, undefined, controller));
      }
    }
  }

  registerRoute(route: Route) {
    debug(
      'Registering route %s %s with args',
       route.verb,
       route.path,
       describeOperationParameters(route.spec));
    this._routes.push(route);
  }

  find(request: ParsedRequest): ResolvedRoute | undefined {
    for (const entry of this._routes) {
      const match = entry.match(request);
      if (match) return match;
    }
    return undefined;
  }
}

export interface ResolvedRouteCommon {
  readonly spec: OperationObject;
  readonly pathParams: PathParameterValues;
}

export interface ResolvedHandlerRoute extends ResolvedRouteCommon {
  readonly handler: Function;
}

export interface ResolvedControllerRoute extends ResolvedRouteCommon {
  readonly controllerName: string;
  readonly methodName: string;
}

export type ResolvedRoute =  ResolvedHandlerRoute | ResolvedControllerRoute;

export class Route {
  public readonly verb: string;
  public readonly path: string;
  private readonly _pathRegexp: pathToRegexp.PathRegExp;

  constructor(
    verb: string,
    path: string,
    public readonly spec: OperationObject,
    private readonly _handler?: Function,
    private readonly _controllerName?: string,
  ) {
    this.verb = verb.toLowerCase();
    this.path = path;

    // In Swagger, path parameters are wrapped in `{}`.
    // In Express.js, path parameters are prefixed with `:`
    path = path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
    this._pathRegexp = pathToRegexp(path, [], {strict: false, end: true});
  }

  match(request: ParsedRequest): ResolvedRoute | undefined {
    debug('trying endpoint', this);
    if (this.verb !== request.method!.toLowerCase()) {
      debug(' -> verb mismatch');
      return undefined;
    }

    const match = this._pathRegexp.exec(request.path);
    if (!match) {
      debug(' -> path mismatch');
      return undefined;
    }

    const pathParams = this._buildPathParams(match);
    debug(' -> found with params: %j', pathParams);

    return this._createResolvedRoute(pathParams);
  }

  private _createResolvedRoute(
    pathParams: PathParameterValues,
  ): ResolvedRoute {
    return this._handler ?
      this._createResolvedHandlerRoute(pathParams) :
      this._createResolvedControllerRoute(pathParams);
  }

  private _createResolvedHandlerRoute(
    pathParams: PathParameterValues,
  ): ResolvedHandlerRoute {
    return {
      handler: this._handler!,
      spec: this.spec,
      pathParams: pathParams,
    };
  }

  private _createResolvedControllerRoute(
    pathParams: PathParameterValues,
  ): ResolvedControllerRoute {
    return {
      controllerName: this._controllerName!,
      methodName: this.spec['x-operation-name']!,
      spec: this.spec,
      pathParams: pathParams,
    };
  }

  private _buildPathParams(pathMatch: RegExpExecArray): PathParameterValues {
    const pathParams = Object.create(null);
    for (const ix in this._pathRegexp.keys) {
      const key = this._pathRegexp.keys[ix];
      const matchIndex = +ix + 1;
      pathParams[key.name] = pathMatch[matchIndex];
    }
    return pathParams;
  }
}

export function isHandlerRoute(
  route: ResolvedRoute,
): route is ResolvedHandlerRoute {
  return (route as ResolvedHandlerRoute).handler !== undefined;
}

export function getRouteName(route: ResolvedRoute) {
  return isHandlerRoute(route) ?
    route.handler.name : // TODO(bajtos) return VERB+PATH when name is not set
    `${route.controllerName}.${route.methodName}()`;
}

function describeOperationParameters(opSpec: OperationObject) {
  return ((opSpec.parameters as ParameterObject[]) || [])
      .map(p => p.name)
      .join(', ');
}
