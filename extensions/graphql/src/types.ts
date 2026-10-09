// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApolloServerOptionsWithStaticSchema, BaseContext} from '@apollo/server';
import {HttpOptions} from '@loopback/http-server';
import {ExecutionArgs} from 'graphql';
import {GraphQLExecutionContextValue, SubscribeMessage} from 'graphql-ws';
import {MiddlewareFn, MiddlewareInterface} from 'type-graphql';

export {Float, ID, Int, ResolverInterface} from 'type-graphql';

/**
 * A GraphQL middleware function or class.
 *
 * `type-graphql` declares this type as `Middleware` but does not export it from
 * the package entry point, so it is declared here to match
 * `type-graphql/build/typings/typings/middleware`.
 */
export type GraphQLMiddleware<TContext extends object = object> =
  | MiddlewareFn<TContext>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | (new (...args: any[]) => MiddlewareInterface<TContext>);

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
