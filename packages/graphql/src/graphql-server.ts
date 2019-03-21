import {
  Constructor,
  Context,
  createBindingFromClass,
  filterByTag,
} from '@loopback/context';
import {Server} from '@loopback/core';
import {HttpOptions, HttpServer} from '@loopback/http-server';
import {ApolloServer, ApolloServerExpressConfig} from 'apollo-server-express';
import * as express from 'express';
import {buildSchema, ResolverInterface} from 'type-graphql';

// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export interface GraphQLServerOptions extends HttpOptions {
  graphql?: ApolloServerExpressConfig;
}

export class GraphQLServer extends Context implements Server {
  public readonly httpServer: HttpServer;
  private _expressApp: express.Application;

  constructor(private options: GraphQLServerOptions = {}) {
    super('graphql-server');
    this._expressApp = express();
    this.httpServer = new HttpServer(this._expressApp, this.options);
  }

  getResolvers(): Constructor<ResolverInterface<object>>[] {
    const view = this.createView(filterByTag('graphql'));
    return view.bindings
      .filter(b => b.valueConstructor != null)
      .map(b => b.valueConstructor as Constructor<ResolverInterface<object>>);
  }

  resolver(resolverClass: Constructor<ResolverInterface<object>>) {
    this.add(
      createBindingFromClass(resolverClass, {
        namespace: 'resolvers',
      }).tag('graphql'),
    );
  }

  async start() {
    const resolverClasses = this.getResolvers();
    // build TypeGraphQL executable schema
    const schema = await buildSchema({
      resolvers: resolverClasses,
      // automatically create `schema.gql` file with schema definition in current folder
      // emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
    });

    const config = Object.assign(
      {
        // enable GraphQL Playground
        playground: true,
      },
      this.options.graphql,
      {schema},
    );
    // Create GraphQL server
    const graphQLServer = new ApolloServer(config);

    graphQLServer.applyMiddleware({app: this._expressApp});

    await this.httpServer.start();
  }

  async stop() {
    this.httpServer.stop();
  }

  get listening() {
    return this.httpServer && this.httpServer.listening;
  }
}
