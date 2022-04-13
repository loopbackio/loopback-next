// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {
  executeExpressRequestHandler,
  ExpressRequestHandler,
  Request,
} from '@loopback/express';
import {
  OpenApiSpec,
  OperationObject,
  SchemasObject,
} from '@loopback/openapi-v3';
import express from 'express';
import {PathParams} from 'express-serve-static-core';
import HttpErrors from 'http-errors';
import {ServeStaticOptions} from 'serve-static';
import {RequestContext} from '../request-context';
import {OperationArgs, OperationRetval, PathParameterValues} from '../types';
import {ResolvedRoute, RouteEntry} from './route-entry';
import {assignRouterSpec, RouterSpec} from './router-spec';

/**
 * A registry of external, Express-style routes. These routes are invoked
 * _after_ no LB4 route (controller or handler based) matched the incoming
 * request.
 *
 * @internal
 */
export class ExternalExpressRoutes {
  protected _externalRoutes: express.Router = express.Router();
  protected _staticRoutes: express.Router = express.Router();
  protected _specForExternalRoutes: RouterSpec = {paths: {}};

  get routerSpec(): RouterSpec {
    return this._specForExternalRoutes;
  }

  public registerAssets(
    path: PathParams,
    rootDir: string,
    options?: ServeStaticOptions,
  ) {
    this._staticRoutes.use(path, express.static(rootDir, options));
  }

  public mountRouter(
    basePath: string,
    router: ExpressRequestHandler,
    spec: RouterSpec = {paths: {}},
  ) {
    this._externalRoutes.use(basePath, router);

    spec = rebaseOpenApiSpec(spec, basePath);
    assignRouterSpec(this._specForExternalRoutes, spec);
  }

  find(request: Request): ResolvedRoute {
    return new ExternalRoute(
      this._externalRoutes,
      this._staticRoutes,
      request.method,
      request.url,
      {
        description: 'External route or a static asset',
        'x-visibility': 'undocumented',
        responses: {},
      },
    );
  }
}

class ExternalRoute implements RouteEntry, ResolvedRoute {
  // ResolvedRoute API
  readonly pathParams: PathParameterValues = [];
  readonly schemas: SchemasObject = {};

  constructor(
    private readonly _externalRouter: express.Router,
    private readonly _staticAssets: express.Router,
    public readonly verb: string,
    public readonly path: string,
    public readonly spec: OperationObject,
  ) {}

  updateBindings(requestContext: Context): void {
    // no-op
  }

  async invokeHandler(
    {request, response}: RequestContext,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    let handled = await executeExpressRequestHandler(
      this._externalRouter,
      request,
      response,
    );
    if (handled) return;

    handled = await executeExpressRequestHandler(
      this._staticAssets,
      request,
      response,
    );
    if (handled) return;

    // Express router called next, which means no route was matched
    throw new HttpErrors.NotFound(
      `Endpoint "${request.method} ${request.path}" not found.`,
    );
  }

  describe(): string {
    // TODO(bajtos) provide better description for Express routes with spec
    return `External Express route "${this.verb} ${this.path}"`;
  }
}

export function rebaseOpenApiSpec<T extends Partial<OpenApiSpec>>(
  spec: T,
  basePath: string,
): T {
  if (!spec.paths) return spec;
  if (!basePath || basePath === '/') return spec;

  const localPaths = spec.paths;
  // Don't modify the spec object provided to us.
  spec = Object.assign({}, spec);
  spec.paths = {};
  for (const url in localPaths) {
    spec.paths[`${basePath}${url}`] = localPaths[url];
  }

  return spec;
}
