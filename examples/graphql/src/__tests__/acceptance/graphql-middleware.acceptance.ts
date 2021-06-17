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

describe('GraphQL middleware', () => {
  let server: GraphQLServer;
  let repo: RecipeRepository;

  beforeEach(givenServer);
  afterEach(stopServer);

  it('invokes middleware', async () => {
    const fieldNamesCapturedByMiddleware: string[] = [];
    // Register a GraphQL middleware
    server.middleware((resolverData, next) => {
      // It's invoked for each field resolver
      fieldNamesCapturedByMiddleware.push(resolverData.info.fieldName);
      return next();
    });

    await startServerAndRepo();
    await supertest(server.httpServer?.url)
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipe1', variables: {}, query: exampleQuery})
      .expect(200);
    expect(fieldNamesCapturedByMiddleware).to.eql([
      // the query
      'recipe',
      // field resolvers
      'title',
      'description',
      'ratings',
      'creationDate',
      'ratingsCount',
      'averageRating',
      'ingredients',
      'numberInCollection',
    ]);
  });

  it('invokes authChecker', async () => {
    const authChecks: string[] = [];
    server
      .bind(GraphQLBindings.GRAPHQL_AUTH_CHECKER)
      .to((resolverData, roles) => {
        authChecks.push(`${resolverData.info.fieldName} ${roles}`);
        return true;
      });
    await startServerAndRepo();
    await supertest(server.httpServer?.url)
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'GetRecipe1', variables: {}, query: exampleQuery})
      .expect(200);
    expect(authChecks).to.eql([
      // the query
      'recipe owner',
    ]);
  });

  async function givenServer() {
    server = new GraphQLServer({host: '127.0.0.1', port: 0});
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
