// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {OperationObject, SchemasObject} from '@loopback/openapi-v3-types';
import {Router, RequestHandler, static as serveStatic} from 'express';
import {PathParams} from 'express-serve-static-core';
import * as HttpErrors from 'http-errors';
import {ServeStaticOptions} from 'serve-static';
import {RequestContext} from '../request-context';
import {
  OperationArgs,
  OperationRetval,
  PathParameterValues,
  Request,
  Response,
} from '../types';
import {ResolvedRoute, RouteEntry} from './route-entry';

export class StaticAssetsRoute implements RouteEntry, ResolvedRoute {
  // ResolvedRoute API
  readonly pathParams: PathParameterValues = [];
  readonly schemas: SchemasObject = {};

  // RouteEntry implementation
  readonly verb: string = 'get';
  readonly path: string = '/*';
  readonly spec: OperationObject = {
    description: 'LoopBack static assets route',
    'x-visibility': 'undocumented',
    responses: {},
  };

  constructor(private readonly _expressRouter: Router = Router()) {}

  public registerAssets(
    path: PathParams,
    rootDir: string,
    options?: ServeStaticOptions,
  ) {
    this._expressRouter.use(path, serveStatic(rootDir, options));
  }

  updateBindings(requestContext: Context): void {
    // no-op
  }

  async invokeHandler(
    {request, response}: RequestContext,
    args: OperationArgs,
  ): Promise<OperationRetval> {
    const handled = await executeRequestHandler(
      this._expressRouter,
      request,
      response,
    );

    if (!handled) {
      // Express router called next, which means no route was matched
      throw new HttpErrors.NotFound(
        `Endpoint "${request.method} ${request.path}" not found.`,
      );
    }
  }

  describe(): string {
    return 'final route to handle static assets';
  }
}

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
  return new Promise((resolve, reject) => {
    const onceFinished = () => resolve(true);
    response.once('finish', onceFinished);
    handler(request, response, (err: Error) => {
      response.removeListener('finish', onceFinished);
      if (err) {
        reject(err);
      } else {
        // Express router called next, which means no route was matched
        resolve(false);
      }
    });
  });
}
