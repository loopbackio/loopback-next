// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createBindingFromClass} from '@loopback/core';
import {GraphQLBindings, GraphQLServer} from '@loopback/graphql';
import {expect, supertest} from '@loopback/testlab';
import {RecipesDataSource} from '../../datasources';
import {RecipeResolver} from '../../graphql-resolvers/recipe-resolver';
import {RecipeRepository} from '../../repositories';
import {sampleRecipes} from '../../sample-recipes';
import {RecipeService} from '../../services/recipe.service';
import {exampleQuery} from './graphql-tests';

describe('GraphQL context', () => {
  let server: GraphQLServer;
  let repo: RecipeRepository;

  before(givenServer);
  after(stopServer);

  it('invokes middleware', async () => {
    await supertest(server.httpServer?.url)
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipe1', variables: {}, query: exampleQuery})
      .expect(200);
  });

  async function givenServer() {
    server = new GraphQLServer({host: '127.0.0.1', port: 0});
    server.resolver(RecipeResolver);

    // Customize the GraphQL context with additional information for test verification
    server.bind(GraphQLBindings.GRAPHQL_CONTEXT_RESOLVER).to(ctx => {
      return {...ctx, meta: 'loopback'};
    });

    // Register a GraphQL middleware to verify context resolution
    server.middleware((resolverData, next) => {
      expect(resolverData.context).to.containEql({meta: 'loopback'});
      return next();
    });

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
