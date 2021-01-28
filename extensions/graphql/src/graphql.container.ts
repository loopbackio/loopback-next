// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
  filterByKey,
  filterByServiceInterface,
} from '@loopback/core';
import {ExpressContext} from 'apollo-server-express/dist/ApolloServer';
import debugFactory from 'debug';
import {ContainerType, ResolverData} from 'type-graphql';
import {GraphQLBindings, GraphQLTags} from './keys';

const debug = debugFactory('loopback:graphql:container');
const MIDDLEWARE_CONTEXT = Symbol.for('loopback.middleware.context');

/**
 * Context for graphql resolver resolution
 */
export class GraphQLResolutionContext extends Context {
  constructor(
    parent: Context,
    readonly resolverClass: Constructor<unknown>,
    readonly resolverData: ResolverData<unknown>,
  ) {
    super(parent);
    this.bind(GraphQLBindings.RESOLVER_DATA).to(resolverData);
    this.bind(GraphQLBindings.RESOLVER_CLASS).to(resolverClass);
  }
}

/**
 * Implementation of `ContainerType` to plug into `type-graphql` as the IoC
 * container
 */
export class LoopBackContainer implements ContainerType {
  constructor(readonly ctx: Context) {}
  get(
    resolverClass: Constructor<unknown>,
    resolverData: ResolverData<unknown>,
  ) {
    debug('Resolving a resolver %s', resolverClass.name, resolverData);

    // Check if the resolverData has the LoopBack RequestContext
    const graphQLCtx = resolverData.context as ExpressContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqCtx = (graphQLCtx?.req as any)?.[MIDDLEWARE_CONTEXT];
    const parent = reqCtx ?? this.ctx;

    const resolutionCtx = new GraphQLResolutionContext(
      parent,
      resolverClass,
      resolverData,
    );
    if (reqCtx == null) {
      resolutionCtx.scope = BindingScope.REQUEST;
    }
    const resolverBinding = createBindingFromClass(resolverClass, {
      defaultNamespace: GraphQLBindings.RESOLVERS,
    });
    // Find resolver bindings that match the class
    const bindings = this.ctx
      .findByTag(GraphQLTags.RESOLVER)
      .filter(filterByServiceInterface(resolverClass));
    if (bindings.length === 0) {
      // No explicit binding found
      debug(
        'Resolver %s not found in context %s',
        resolverClass.name,
        this.ctx.name,
      );
      // Let's use the resolution context to resolve it from the class
      resolutionCtx.add(resolverBinding);
      return resolutionCtx.getValueOrPromise(resolverBinding.key);
    }

    let found: Readonly<Binding> | undefined;
    if (bindings.length === 1) {
      // Only one found, use it
      found = bindings[0];
    } else {
      // Narrow down by key
      found = bindings.find(filterByKey(resolverBinding.key));
      if (!found) {
        found = bindings[0];
      }
    }

    debug(
      'Resolver %s found in context %s',
      resolverClass.name,
      resolutionCtx.name,
      found,
    );
    return resolutionCtx.getValueOrPromise(found.key);
  }
}
