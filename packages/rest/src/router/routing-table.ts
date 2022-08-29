// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ControllerSpec,
  OperationObject,
  ParameterObject,
  PathObject,
} from '@loopback/openapi-v3';
import debugFactory from 'debug';
import HttpErrors from 'http-errors';
import {Request} from '../types';
import {
  ControllerClass,
  ControllerFactory,
  createRoutesForController,
} from './controller-route';
import {ExternalExpressRoutes} from './external-express-routes';
import {validateApiPath} from './openapi-path';
import {RestRouter} from './rest-router';
import {ResolvedRoute, RouteEntry} from './route-entry';
import {TrieRouter} from './trie-router';

const debug = debugFactory('loopback:rest:routing-table');

/**
 * Routing table
 */
export class RoutingTable {
  constructor(
    private readonly _router: RestRouter = new TrieRouter(),
    private _externalRoutes?: ExternalExpressRoutes,
  ) {}

  /**
   * Register a controller as the route
   * @param spec
   * @param controllerCtor
   * @param controllerFactory
   */
  registerController<T extends object>(
    spec: ControllerSpec,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
  ) {
    const routes = createRoutesForController(
      spec,
      controllerCtor,
      controllerFactory,
    );
    for (const route of routes) {
      this.registerRoute(route);
    }
  }

  /**
   * Register a route
   * @param route - A route entry
   */
  registerRoute(route: RouteEntry) {
    // TODO(bajtos) handle the case where opSpec.parameters contains $ref
    // See https://github.com/loopbackio/loopback-next/issues/435
    /* istanbul ignore if */
    if (debug.enabled) {
      debug(
        'Registering route %s %s -> %s(%s)',
        route.verb.toUpperCase(),
        route.path,
        route.describe(),
        describeOperationParameters(route.spec),
      );
    }

    validateApiPath(route.path);

    this._router.add(route);
  }

  describeApiPaths(): PathObject {
    const paths: PathObject = {};

    for (const route of this._router.list()) {
      if (route.spec['x-visibility'] === 'undocumented') continue;
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      paths[route.path][route.verb] = route.spec;
    }

    return paths;
  }

  /**
   * Map a request to a route
   * @param request
   */
  find(request: Request): ResolvedRoute {
    debug('Finding route for %s %s', request.method, request.path);

    const found = this._router.find(request);

    if (found) {
      debug('Route matched: %j', found);
      return found;
    }

    if (this._externalRoutes) {
      debug(
        'No API route found for %s %s, trying to find an external Express route',
        request.method,
        request.path,
      );

      return this._externalRoutes.find(request);
    }

    debug('No route found for %s %s', request.method, request.path);
    throw new HttpErrors.NotFound(
      `Endpoint "${request.method} ${request.path}" not found.`,
    );
  }
}

function describeOperationParameters(opSpec: OperationObject) {
  return ((opSpec.parameters as ParameterObject[]) || [])
    .map(p => p?.name || '')
    .join(', ');
}
