// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingFromClassOptions,
  BindingKey,
  BindingScope,
  config,
  Constructor,
  Context,
  ContextTags,
  createBindingFromClass,
  filterByTag,
  inject,
  lifeCycleObserver,
  Server,
} from '@loopback/core';
import {HttpServer} from '@loopback/http-server';
import {ContextFunction} from 'apollo-server-core';
import {
  ApolloServer,
  ApolloServerExpressConfig,
  PubSub,
  PubSubEngine,
} from 'apollo-server-express';
import {ExpressContext} from 'apollo-server-express/dist/ApolloServer';
import express from 'express';
import {
  AuthChecker,
  buildSchema,
  NonEmptyArray,
  ResolverInterface,
} from 'type-graphql';
import {Middleware} from 'type-graphql/dist/interfaces/Middleware';
import {LoopBackContainer} from './graphql.container';
import {GraphQLBindings, GraphQLTags} from './keys';
import {GraphQLServerOptions} from './types';

/**
 * GraphQL Server
 */
@lifeCycleObserver('server', {
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.KEY]: GraphQLBindings.GRAPHQL_SERVER},
})
export class GraphQLServer extends Context implements Server {
  readonly httpServer?: HttpServer;
  readonly expressApp: express.Application;

  constructor(
    @config() private options: GraphQLServerOptions = {},
    @inject.context()
    parent?: Context,
  ) {
    super(parent, 'graphql-server');
    this.scope = BindingScope.SERVER;
    this.expressApp = express();
    if (options.expressSettings) {
      for (const p in options.expressSettings) {
        this.expressApp.set(p, options.expressSettings[p]);
      }
    }

    // Create a standalone http server if GraphQL is mounted as an Express
    // middleware to a RestServer from `@loopback/rest`
    if (!options.asMiddlewareOnly) {
      this.httpServer = new HttpServer(this.expressApp, this.options);
    }
  }

  /**
   * Get a list of resolver classes
   */
  getResolverClasses(): Constructor<ResolverInterface<object>>[] {
    const view = this.createView(filterByTag(GraphQLTags.RESOLVER));
    return view.bindings
      .filter(b => b.valueConstructor != null)
      .map(b => b.valueConstructor as Constructor<ResolverInterface<object>>);
  }

  /**
   * Get a list of middleware
   */
  async getMiddlewareList(): Promise<Middleware<unknown>[]> {
    const view = this.createView<Middleware<unknown>>(
      filterByTag(GraphQLTags.MIDDLEWARE),
    );
    return view.values();
  }

  /**
   * Register a GraphQL middleware
   * @param middleware - GraphQL middleware
   */
  middleware<T = unknown>(middleware: Middleware<T>): Binding<Middleware<T>> {
    return this.bind<Middleware<T>>(BindingKey.generate(`graphql.middleware`))
      .to(middleware)
      .tag(GraphQLTags.MIDDLEWARE);
  }

  /**
   * Register a GraphQL resolver class
   * @param resolverClass -GraphQL resolver class
   * @param nameOrOptions - Resolver name or binding options
   */
  resolver(
    resolverClass: Constructor<ResolverInterface<object>>,
    nameOrOptions?: string | BindingFromClassOptions,
  ) {
    return registerResolver(this, resolverClass, nameOrOptions);
  }

  async start() {
    const resolverClasses = (this.getResolverClasses() as unknown) as NonEmptyArray<
      Function
    >;

    // Get the configured auth checker
    const authChecker: AuthChecker =
      (await this.get(GraphQLBindings.GRAPHQL_AUTH_CHECKER, {
        optional: true,
      })) ?? ((resolverData, roles) => true);

    const pubSub: PubSubEngine | undefined =
      (await this.get(GraphQLBindings.PUB_SUB_ENGINE, {
        optional: true,
      })) ?? new PubSub();

    // build TypeGraphQL executable schema
    const schema = await buildSchema({
      // See https://github.com/MichalLytek/type-graphql/issues/150#issuecomment-420181526
      validate: false,
      resolvers: resolverClasses,
      // automatically create `schema.gql` file with schema definition in current folder
      // emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
      container: new LoopBackContainer(this),
      authChecker,
      pubSub,
      globalMiddlewares: await this.getMiddlewareList(),
    });

    // Allow a graphql context resolver to be bound to GRAPHQL_CONTEXT_RESOLVER
    const graphqlContextResolver: ContextFunction<ExpressContext> =
      (await this.get(GraphQLBindings.GRAPHQL_CONTEXT_RESOLVER, {
        optional: true,
      })) ?? (context => context);

    // Create ApolloServerExpress GraphQL server
    const serverConfig: ApolloServerExpressConfig = {
      // enable GraphQL Playground
      playground: true,
      context: graphqlContextResolver,
      subscriptions: false,
      ...this.options.apollo,
      schema,
    };
    const graphQLServer = new ApolloServer(serverConfig);
    graphQLServer.applyMiddleware({app: this.expressApp});

    // Set up subscription handlers
    if (this.httpServer && serverConfig.subscriptions) {
      graphQLServer.installSubscriptionHandlers(this.httpServer?.server);
    }

    // Start the http server if created
    await this.httpServer?.start();
  }

  async stop() {
    // Stop the http server if created
    await this.httpServer?.stop();
  }

  /**
   * Is the GraphQL listening
   */
  get listening() {
    return !!this.httpServer?.listening;
  }
}

/**
 * Register a GraphQL resolver class
 * @param ctx - Context object
 * @param resolverClass - Resolver class
 * @param nameOrOptions - Resolver name or binding options
 */
export function registerResolver(
  ctx: Context,
  resolverClass: Constructor<object>,
  nameOrOptions?: string | BindingFromClassOptions,
): Binding {
  const binding = createBindingFromClass(resolverClass, {
    namespace: GraphQLBindings.RESOLVERS,
    ...toOptions(nameOrOptions),
  }).tag(GraphQLTags.RESOLVER);
  ctx.add(binding);
  return binding;
}

/**
 * Normalize name or options to `BindingFromClassOptions`
 * @param nameOrOptions - Name or options for binding from class
 */
function toOptions(nameOrOptions?: string | BindingFromClassOptions) {
  if (typeof nameOrOptions === 'string') {
    return {name: nameOrOptions};
  }
  return nameOrOptions ?? {};
}
