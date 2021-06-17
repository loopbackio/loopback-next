// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  Component,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';
import {GraphQLResolverBooter} from './booters/resolver.booter';
import {GraphQLServer} from './graphql.server';
import {GraphQLBindings} from './keys';

/**
 * Component for GraphQL
 */
export class GraphQLComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(GraphQLServer),
    createBindingFromClass(GraphQLResolverBooter),
  ];

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app
      .configure(GraphQLBindings.GRAPHQL_SERVER)
      .toAlias(GraphQLBindings.CONFIG);
  }
}
