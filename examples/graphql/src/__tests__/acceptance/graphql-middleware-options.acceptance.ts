// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createBindingFromClass} from '@loopback/core';
import {GraphQLServer} from '@loopback/graphql';
import {supertest} from '@loopback/testlab';
import {RecipesDataSource} from '../../datasources';
import {RecipeResolver} from '../../graphql-resolvers/recipe-resolver';
import {RecipeRepository} from '../../repositories';
import {sampleRecipes} from '../../sample-recipes';
import {RecipeService} from '../../services/recipe.service';
import {exampleQuery} from './graphql-tests';

describe('GraphQL middleware', () => {
  let server: GraphQLServer;
  let repo: RecipeRepository;

  beforeEach(givenServer);
  afterEach(stopServer);

  it('invokes middleware', async () => {
    await startServerAndRepo();
    await supertest(server.httpServer?.url)
      .post('/gql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipe1', variables: {}, query: exampleQuery})
      .expect(200);
  });

  async function givenServer() {
    server = new GraphQLServer({
      host: '127.0.0.1',
      port: 0,
      middlewareOptions: {path: '/gql'},
    });
    server.resolver(RecipeResolver);
    server.bind('recipes').to([...sampleRecipes]);
    const repoBinding = createBindingFromClass(RecipeRepository);
    server.add(repoBinding);
    server.add(createBindingFromClass(RecipesDataSource));
    server.add(createBindingFromClass(RecipeService));
    repo = await server.get<RecipeRepository>(repoBinding.key);
  }

  async function startServerAndRepo() {
    await server.start();
    await repo.start();
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
    repo.stop();
  }
});
