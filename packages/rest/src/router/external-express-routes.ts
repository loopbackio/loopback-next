// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {
  OpenApiSpec,
  OperationObject,
  SchemasObject,
} from '@loopback/openapi-v3';
import * as express from 'express';
import {RequestHandler} from 'express';
import {PathParams} from 'express-serve-static-core';
import * as HttpErrors from 'http-errors';
import * as onFinished from 'on-finished';
import {ServeStaticOptions} from 'serve-static';
import {promisify} from 'util';
import {RequestContext} from '../request-context';
import {
  OperationArgs,
  OperationRetval,
  PathParameterValues,
  Request,
  Response,
} from '../types';
import {ResolvedRoute, RouteEntry} from './route-entry';
import {assignRouterSpec, RouterSpec} from './router-spec';

export type ExpressRequestHandler = express.RequestHandler;

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
    let handled = await executeRequestHandler(
      this._externalRouter,
      request,
      response,
    );
    if (handled) return;

    handled = await executeRequestHandler(
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

const onFinishedAsync = promisify(onFinished);

/**
 * Execute an Express-style callback-based request handler.
 *
 * @param handler
 * @param request
 * @param response
 * @returns A promise resolved to:
 * - `true` when the request was handled
 * - `false` when the handler called `next()` to proceed to the next
 *    handler (middleware) in the chain.
 */
function executeRequestHandler(
  handler: RequestHandler,
  request: Request,
  response: Response,
): Promise<boolean> {
  const responseWritten = onFinishedAsync(response).then(() => true);
  const handlerFinished = new Promise<boolean>((resolve, reject) => {
    handler(request, response, err => {
      if (err) {
        reject(err);
      } else {
        // Express router called next, which means no route was matched
        resolve(false);
      }
    });
  });
  return Promise.race([handlerFinished, responseWritten]);
}
