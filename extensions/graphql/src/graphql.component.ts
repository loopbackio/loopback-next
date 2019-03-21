// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Component,
  config,
  createBindingFromClass,
} from '@loopback/core';
import {GraphQLResolverBooter} from './booters/resolver.booter';
import {GraphQLServer} from './graphql.server';
import {GraphQLComponentOptions} from './types';

/**
 * Component for GraphQL
 */
export class GraphQLComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(GraphQLServer),
    createBindingFromClass(GraphQLResolverBooter),
  ];

  constructor(@config() private options: GraphQLComponentOptions = {}) {}
}
