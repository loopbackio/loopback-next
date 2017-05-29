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
import {PathParameterValues, ParsedRequest} from './SwaggerRouter';

import * as assert from 'assert';
const debug = require('debug')('loopback:core:routing-table');

// TODO(bajtos) Refactor this code to use Trie-based lookup,
// e.g. via wayfarer/trie or find-my-way
import * as pathToRegexp from 'path-to-regexp';

export class RoutingTable<ControllerType> {
  private readonly _routes: RouteEntry<ControllerType>[] = [];

  define(controller: ControllerType, spec: OpenApiSpec) {
    assert(typeof spec === 'object' && !!spec, 'API specification must be a non-null object');
    if (!spec.paths || !Object.keys(spec.paths).length) {
      return;
    }

    debug('Registering Controller with API', spec);

    for (const path in spec.paths) {
      for (const verb in spec.paths[path]) {
        const opSpec: OperationObject = spec.paths[path][verb];
        // TODO(bajtos) handle the case where opSpec.parameters contains $ref
        debug('  %s %s -> %s(%s)', verb, path, opSpec['x-operation-name'],
          (opSpec.parameters as ParameterObject[] || []).map(p => p.name).join(', '));
        this._routes.push(new RouteEntry(path, verb, opSpec, controller));
      }
    }
  }

  find(request: ParsedRequest) : ResolvedRoute<ControllerType> | undefined {
    for (const entry of this._routes) {
      const match = entry.match(request);
      if (match) return match;
    }
    return undefined;
  }
}

export interface ResolvedRoute<ControllerType> {
  readonly controller: ControllerType;
  readonly methodName: string;
  readonly spec: OperationObject;
  readonly pathParams: PathParameterValues;
}

class RouteEntry<ControllerType> {
  private readonly _verb: string;
  private readonly _pathRegexp: pathToRegexp.PathRegExp;

  constructor(
      path: string,
      verb: string,
      private readonly _spec: OperationObject,
      private readonly _controller: ControllerType) {

    this._verb = verb.toLowerCase();

    // In Swagger, path parameters are wrapped in `{}`.
    // In Express.js, path parameters are prefixed with `:`
    path = path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
    this._pathRegexp = pathToRegexp(path, [], {strict: false, end: true});
  }

  match(request: ParsedRequest): ResolvedRoute<ControllerType> | undefined {
    debug('trying endpoint', this);
    if (this._verb !== request.method!.toLowerCase()) {
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

  private _createResolvedRoute(pathParams: PathParameterValues): ResolvedRoute<ControllerType> {
    return {
      controller: this._controller,
      methodName: this._spec['x-operation-name'],
      spec: this._spec,
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
