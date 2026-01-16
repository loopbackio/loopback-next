// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AppOptions, BuildContextArgs} from '@graphql-ez/express';
import {HttpOptions} from '@loopback/http-server';
export {Float, ID, Int, ResolverInterface} from 'type-graphql';
export {Middleware as GraphQLMiddleware} from 'type-graphql/dist/interfaces/Middleware';

/**
 * Options for GraphQL component
 */
export interface GraphQLComponentOptions {
  // To be added
}

/**
 * Options for GraphQL server
 */
export interface GraphQLServerOptions extends HttpOptions {
  graphql?: AppOptions;

  /**
   * Express settings
   */
  expressSettings?: Record<string, unknown>;
  /**
   * Use as a middleware for RestServer instead of a standalone server
   */
  asMiddlewareOnly?: boolean;
}

export type ContextFunction = (
  args: BuildContextArgs,
) => Record<string, unknown> | Promise<Record<string, unknown>>;
