// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Constructor, CoreBindings} from '@loopback/core';
import {AuthChecker, PubSubEngine, ResolverData} from 'type-graphql';
import {GraphQLComponent} from './graphql.component';
import {GraphQLServer} from './graphql.server';
import {ContextFunction, GraphQLServerOptions} from './types';

/**
 * Namespace for GraphQL related bindings
 */
export namespace GraphQLBindings {
  /**
   * Binding key for setting and injecting GraphQLServerConfig
   */
  export const CONFIG: BindingKey<GraphQLServerOptions> =
    CoreBindings.APPLICATION_CONFIG.deepProperty('graphql');

  /**
   * Binding key for the GraphQL server
   */
  export const GRAPHQL_SERVER = BindingKey.create<GraphQLServer>(
    'servers.GraphQLServer',
  );

  /**
   * Binding key for the GraphQL component
   */
  export const COMPONENT = BindingKey.create<GraphQLComponent>(
    'components.GraphQLComponent',
  );

  /**
   * Binding key for the GraphQL context resolver
   */
  export const GRAPHQL_CONTEXT_RESOLVER = BindingKey.create<ContextFunction>(
    'graphql.contextResolver',
  );

  /**
   * Binding key for the GraphQL auth checker
   */
  export const GRAPHQL_AUTH_CHECKER = BindingKey.create<AuthChecker>(
    'graphql.authChecker',
  );

  /**
   * Binding key for the GraphQL pub/sub engine
   */
  export const PUB_SUB_ENGINE = BindingKey.create<PubSubEngine>(
    'graphql.pubSubEngine',
  );

  /**
   * Binding key for the GraphQL resolver data - which is bound per request
   */
  export const RESOLVER_DATA = BindingKey.create<ResolverData<unknown>>(
    'graphql.resolverData',
  );

  /**
   * Binding key for the current resolver class
   */
  export const RESOLVER_CLASS = BindingKey.create<Constructor<unknown>>(
    'graphql.resolverClass',
  );

  /**
   * Binding key namespace for resolvers
   */
  export const RESOLVERS = 'graphql.resolvers';
}

/**
 * Namespace for GraphQL related tags
 */
export namespace GraphQLTags {
  /**
   * GraphQL
   */
  export const GRAPHQL = 'graphql';

  /**
   * Tag for GraphQL resolver bindings
   */
  export const RESOLVER = 'graphql.resolver';

  /**
   * Tag for GraphQL middleware bindings
   */
  export const MIDDLEWARE = 'graphql.middleware';
}
