// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {GraphQLServer} from '@loopback/graphql';
import {
  createRestAppClient,
  givenHttpServerConfig,
  supertest,
} from '@loopback/testlab';
import {GraphqlDemoApplication} from '../../';
import {RecipesDataSource} from '../../datasources';
import {RecipeResolver} from '../../graphql-resolvers/recipe-resolver';
import {RecipeRepository} from '../../repositories';
import {sampleRecipes} from '../../sample-recipes';
import {RecipeService} from '../../services/recipe.service';
import {runTests} from './graphql-tests';

describe('GraphQL server', () => {
  let server: GraphQLServer;
  let repo: RecipeRepository;

  before(givenServer);
  after(stopServer);

  runTests(() => supertest(server.httpServer?.url));

  async function givenServer() {
    server = new GraphQLServer({host: '127.0.0.1', port: 0});
    server.resolver(RecipeResolver);

    server.bind('recipes').to([...sampleRecipes]);
    const repoBinding = createBindingFromClass(RecipeRepository);
    server.add(repoBinding);
    server.add(createBindingFromClass(RecipesDataSource));
    server.add(createBindingFromClass(RecipeService));
    await server.start();
    repo = await server.get<RecipeRepository>(repoBinding.key);
    await repo.start();
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
    repo.stop();
  }
});

describe('GraphQL application', () => {
  let server: GraphQLServer;
  let app: Application;

  before(givenApp);
  after(stopApp);

  runTests(() => supertest(server.httpServer?.url));

  async function givenApp() {
    app = new Application();
    const serverBinding = app.server(GraphQLServer);
    app.configure(serverBinding.key).to({host: '127.0.0.1', port: 0});
    server = await app.getServer(GraphQLServer);
    server.resolver(RecipeResolver);

    app.bind('recipes').to([...sampleRecipes]);
    const repoBinding = createBindingFromClass(RecipeRepository);
    app.add(repoBinding);
    app.add(createBindingFromClass(RecipesDataSource));
    app.add(createBindingFromClass(RecipeService));
    await app.start();
  }

  async function stopApp() {
    if (!app) return;
    await app.stop();
  }
});

describe('GraphQL as middleware', () => {
  let app: GraphqlDemoApplication;

  before(giveAppWithGraphQLMiddleware);
  after(stopApp);

  runTests(() => createRestAppClient(app));

  async function giveAppWithGraphQLMiddleware() {
    app = new GraphqlDemoApplication({rest: givenHttpServerConfig()});
    await app.boot();
    await app.start();
    return app;
  }

  async function stopApp() {
    await app?.stop();
  }
});
