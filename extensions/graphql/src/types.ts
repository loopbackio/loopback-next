// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {HttpOptions} from '@loopback/http-server';
import {
  ApolloServerOptions, ApolloServerOptionsWithStaticSchema, BaseContext,
} from '@apollo/server';
import { ExpressMiddlewareOptions } from '@apollo/server/dist/esm/express4';

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
export interface GraphQLServerOptions<TContext extends BaseContext = BaseContext> extends HttpOptions {
  /**
   * ApolloServerExpress related configuration
   */
  apollo?: Partial<ApolloServerOptionsWithStaticSchema<TContext>>;

  /**
   * Middleware options for GraphQL
   */
  middlewareOptions?: ExpressMiddlewareOptions<TContext>; // GetMiddlewareOptions;

  /**
   * Express settings
   */
  expressSettings?: Record<string, unknown>;
  /**
   * Use as a middleware for RestServer instead of a standalone server
   */
  asMiddlewareOnly?: boolean;
  
  wsOptions?: {
    host?: string;
    port: number;
    path: string;
  }
  
  useMockups?: boolean;
  mocks?: any;
  
  validate?: boolean;
}
