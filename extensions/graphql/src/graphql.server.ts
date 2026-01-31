// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ApolloServer,
  ApolloServerOptionsWithSchema,
  BaseContext,
} from '@apollo/server';
import {ExpressMiddlewareOptions} from '@apollo/server/dist/esm/express4';
import {expressMiddleware} from '@apollo/server/express4';
import {printSchemaWithDirectives} from '@graphql-tools/utils';
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
import {RestBindings, RestServer} from '@loopback/rest';
import pkg from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import {GraphQLSchema, lexicographicSortSchema} from 'graphql';
import {useServer} from 'graphql-ws/lib/use/ws';
import * as http from 'http';
import * as https from 'https';
import {
  AuthChecker,
  buildSchema,
  NonEmptyArray,
  ResolverInterface,
  BuildSchemaOptions as TypeGrahpQLBuildSchemaOptions,
} from 'type-graphql';
import {Middleware} from 'type-graphql/build/typings/typings/middleware';
import {WebSocketServer} from 'ws';
import {LoopBackContainer} from './graphql.container';
import {GraphQLBindings, GraphQLTags} from './keys';
import {GraphQLServerOptions} from './types';
const {json} = pkg;

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
  private schema?: GraphQLSchema;
  private wsServer?: WebSocketServer;
  private wsHttpServer?: http.Server | https.Server;

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
  async getMiddlewareList<T extends {}>(): Promise<Middleware<T>[]> {
    const view = this.createView<Middleware<T>>(
      filterByTag(GraphQLTags.MIDDLEWARE),
    );
    return view.values();
  }

  /**
   * Register a GraphQL middleware
   * @param middleware - GraphQL middleware
   */
  middleware<T extends {}>(middleware: Middleware<T>): Binding<Middleware<T>> {
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

  private async _setupSchema() {
    const resolverClasses =
      this.getResolverClasses() as unknown as NonEmptyArray<Function>;

    // Get the configured auth checker
    const authChecker: AuthChecker =
      (await this.get(GraphQLBindings.GRAPHQL_AUTH_CHECKER, {
        optional: true,
      })) ?? ((resolverData, roles) => true);

    const pubSub = await this.get(GraphQLBindings.PUB_SUB, {optional: true});

    // build TypeGraphQL executable schema
    const buildSchemaOptions: TypeGrahpQLBuildSchemaOptions = {
      validate: !!this.options.validate,
      resolvers: resolverClasses,
      // automatically create `schema.gql` file with schema definition in current folder
      // emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
      container: new LoopBackContainer(this),
      authChecker,
      pubSub,
      globalMiddlewares: await this.getMiddlewareList(),
    };
    return buildSchema(buildSchemaOptions);
  }

  async start() {
    const schema = await this._setupSchema();
    this.schema = schema;
    // Allow a graphql context resolver to be bound to GRAPHQL_CONTEXT_RESOLVER
    const graphqlContextResolver: ExpressMiddlewareOptions<BaseContext>['context'] =
      (await this.get(GraphQLBindings.GRAPHQL_CONTEXT_RESOLVER, {
        optional: true,
      })) ?? (async context => context);
    // Allow a graphql context resolver to be bound to GRAPHQL_CONTEXT_RESOLVER
    const graphqlWsContextResolver =
      (await this.get(GraphQLBindings.GRAPHQL_WS_CONTEXT_RESOLVER, {
        optional: true,
      })) ??
      (async (context: object) => {
        return context;
      });

    // Create ApolloServerExpress GraphQL server
    const serverConfig = {
      ...this.options.apollo,
      schema,
      status400ForVariableCoercionErrors: true,
      // plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })],
    } as ApolloServerOptionsWithSchema<BaseContext>;
    const graphQLServer = new ApolloServer(serverConfig);
    await graphQLServer.start();
    this.expressApp.use(
      this.options.graphQLPath ?? '/',
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(graphQLServer, {
        context: graphqlContextResolver,
        ...this.options.middlewareOptions,
      }),
    );
    // Start the http server if created
    await this.httpServer?.start();

    let server;
    if (this.options.asMiddlewareOnly) {
      const rest: RestServer = await this.get(RestBindings.SERVER);
      server = rest.httpServer?.server;
    } else {
      server = this.httpServer?.server;
    }
    const wsServer = new WebSocketServer({
      server: server,
      path: this.options.path,
    });
    this.wsServer = wsServer;
    useServer(
      {
        schema,
        context: graphqlWsContextResolver,
      },
      wsServer,
    );
  }

  async exportGraphQLSchema(outFile = '', log = console.log) {
    const schema = await this._setupSchema();
    const schemaFileContent = printSchemaWithDirectives(
      lexicographicSortSchema(schema),
    );
    if (outFile === '-' || outFile === '') {
      log('%s', schemaFileContent);
    } else {
      fs.writeFileSync(outFile, schemaFileContent, 'utf-8');
    }
  }

  async stop() {
    // Stop the http server if created
    await this.httpServer?.stop();
    // Stop ws http server
    await this.closeWsHttpServer();
    // Stop the websocket server if created
    await this.closeWsServer();
  }

  /**
   * Is the GraphQL listening
   */
  get listening() {
    return !!this.httpServer?.listening;
  }

  getSchema(): GraphQLSchema {
    return this.schema!;
  }

  private closeWsHttpServer(): Promise<void> {
    if (!this.wsHttpServer) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.wsHttpServer?.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private closeWsServer(): Promise<void> {
    if (!this.wsServer) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.wsServer?.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
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
