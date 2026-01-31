// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApolloServerOptionsWithStaticSchema, BaseContext} from '@apollo/server';
import {HttpOptions} from '@loopback/http-server';
import {ExecutionArgs} from 'graphql';
import {GraphQLExecutionContextValue, SubscribeMessage} from 'graphql-ws';

export {Float, ID, Int, ResolverInterface} from 'type-graphql';
export {Middleware as GraphQLMiddleware} from 'type-graphql/build/typings/typings/middleware';

/**
 * Options for GraphQL component
 */
export interface GraphQLComponentOptions {
  // To be added
}

/**
 * Options for GraphQL server
 */
export interface GraphQLServerOptions<
  TContext extends BaseContext = BaseContext,
> extends HttpOptions {
  /**
   * ApolloServerExpress related configuration
   */
  apollo?: Partial<ApolloServerOptionsWithStaticSchema<TContext>>;

  /**
   * Middleware options for GraphQL
   */
  middlewareOptions?: Record<string, unknown>;

  /**
   * Express settings
   */
  expressSettings?: Record<string, unknown>;
  /**
   * Use as a middleware for RestServer instead of a standalone server
   */
  asMiddlewareOnly?: boolean;

  graphQLPath?: string;

  validate?: boolean;
}

export type GraphQLWsContextResolver = (
  ctx: {[key: string]: unknown},
  message: SubscribeMessage,
  args: ExecutionArgs,
) => Promise<GraphQLExecutionContextValue> | GraphQLExecutionContextValue;
