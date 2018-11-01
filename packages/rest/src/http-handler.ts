// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {ControllerSpec} from '@loopback/openapi-v3';
import {
  OperationObject,
  ParameterObject,
  PathObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import * as assert from 'assert';
import * as debugFactory from 'debug';
import {PathParams} from 'express-serve-static-core';
import * as HttpErrors from 'http-errors';
import {ServeStaticOptions} from 'serve-static';
import {inspect} from 'util';
import {RestBindings} from './keys';
import {RequestContext} from './request-context';
import {
  ControllerClass,
  ControllerFactory,
  ControllerRoute,
  ResolvedRoute,
  RestRouter,
  RouteEntry,
  StaticAssetsRoute,
  TrieRouter,
  validateApiPath,
} from './router';
import {SequenceHandler} from './sequence';
import {Request, Response} from './types';

const debug = debugFactory('loopback:rest:http-handler');

export class HttpHandler {
  protected _apiDefinitions: SchemasObject;
  private _staticAssetsRoute?: StaticAssetsRoute;

  public handleRequest: (request: Request, response: Response) => Promise<void>;

  constructor(
    protected _rootContext: Context,
    protected readonly _router: RestRouter = new TrieRouter(),
  ) {
    this.handleRequest = (req, res) => this._handleRequest(req, res);
  }

  /**
   * Register a controller as the route
   * @param spec
   * @param controllerCtor
   * @param controllerFactory
   */
  registerController<T>(
    spec: ControllerSpec,
    controllerCtor: ControllerClass<T>,
    controllerFactory?: ControllerFactory<T>,
  ) {
    assert(
      typeof spec === 'object' && !!spec,
      'API specification must be a non-null object',
    );
    if (!spec.paths || !Object.keys(spec.paths).length) {
      return;
    }

    debug('Registering Controller with API %s', inspect(spec, {depth: null}));

    const basePath = spec.basePath || '/';
    for (const p in spec.paths) {
      for (const verb in spec.paths[p]) {
        const opSpec: OperationObject = spec.paths[p][verb];
        const fullPath = HttpHandler.joinPath(basePath, p);
        const route = new ControllerRoute(
          verb,
          fullPath,
          opSpec,
          controllerCtor,
          controllerFactory,
        );
        this.registerRoute(route);
      }
    }
  }

  /**
   * Register a route
   * @param route A route entry
   */
  registerRoute(route: RouteEntry) {
    // TODO(bajtos) handle the case where opSpec.parameters contains $ref
    // See https://github.com/strongloop/loopback-next/issues/435
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

  /**
   * Setup routes to serve static assets.
   *
   * @param path The URL path where to serve the assets, e.g. `/images`.
   * @param rootDir The local path where to load the assets from.
   * @param options Additional configuration, e.g. cache control.
   */
  registerStaticAssets(
    path: PathParams,
    rootDir: string,
    options?: ServeStaticOptions,
  ) {
    if (!this._staticAssetsRoute) {
      this._staticAssetsRoute = new StaticAssetsRoute();
    }
    this._staticAssetsRoute.registerAssets(path, rootDir, options);
  }

  static joinPath(basePath: string, path: string) {
    const fullPath = [basePath, path]
      .join('/') // Join by /
      .replace(/(\/){2,}/g, '/') // Remove extra /
      .replace(/\/$/, '') // Remove trailing /
      .replace(/^(\/)?/, '/'); // Add leading /
    return fullPath;
  }

  registerApiDefinitions(defs: SchemasObject) {
    this._apiDefinitions = Object.assign({}, this._apiDefinitions, defs);
  }

  getApiDefinitions() {
    return this._apiDefinitions;
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

  findRoute(request: Request): ResolvedRoute {
    const route = this._findRouteImpl(request);
    Object.assign(route.schemas, this.getApiDefinitions());
    return route;
  }

  private _findRouteImpl(request: Request): ResolvedRoute {
    debug('Finding route %s for %s %s', request.method, request.path);

    const found = this._router.find(request);

    if (found) {
      debug('Route matched: %j', found);
      return found;
    }

    // this._staticAssetsRoute will be set only if app.static() was called
    if (this._staticAssetsRoute) {
      debug(
        'No API route found for %s %s, trying to find a static asset',
        request.method,
        request.path,
      );

      return this._staticAssetsRoute;
    }

    debug('No route found for %s %s', request.method, request.path);
    throw new HttpErrors.NotFound(
      `Endpoint "${request.method} ${request.path}" not found.`,
    );
  }

  protected async _handleRequest(
    request: Request,
    response: Response,
  ): Promise<void> {
    const requestContext = new RequestContext(
      request,
      response,
      this._rootContext,
    );

    const sequence = await requestContext.get<SequenceHandler>(
      RestBindings.SEQUENCE,
    );
    await sequence.handle(requestContext);
  }
}

function describeOperationParameters(opSpec: OperationObject) {
  return ((opSpec.parameters as ParameterObject[]) || [])
    .map(p => (p && p.name) || '')
    .join(', ');
}
