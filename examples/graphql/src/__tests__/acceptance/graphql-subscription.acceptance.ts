// Copyright IBM Corp. and LoopBack contributors 2024. All Rights Reserved.
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createBindingFromClass} from '@loopback/core';
import {GraphQLServer} from '@loopback/graphql';
import {expect, supertest} from '@loopback/testlab';
import {createClient, Client as WsClient} from 'graphql-ws';
import WebSocket from 'ws';
import {RecipesDataSource} from '../../datasources';
import {RecipeResolver} from '../../graphql-resolvers/recipe-resolver';
import {RecipeRepository} from '../../repositories';
import {sampleRecipes} from '../../sample-recipes';
import {RecipeService} from '../../services/recipe.service';
import {exampleQuery} from './graphql-tests';

describe('GraphQL server subscription', () => {
  let server: GraphQLServer;
  let repo: RecipeRepository;
  let client: supertest.SuperTest<supertest.Test>;
  let wsClient: WsClient;
  let notificationIter: AsyncIterableIterator<unknown>;

  before('setup server and add recipe', async function () {
    await setupServerAndSubscribe();
    await addRecipe();
  });

  after('unsubscribe and stop server', async function () {
    await notificationIter.return?.();
    await wsClient.dispose();
    await stopServer();
  });

  it('should receive notification', async function () {
    const {value: notification} = await notificationIter.next();
    expect(notification.data.recipeCreated).to.containEql({
      id: '4',
      numberInCollection: 4,
    });
  });

  async function setupServerAndSubscribe() {
    server = new GraphQLServer({
      host: '127.0.0.1',
      port: 0,
    });
    server.resolver(RecipeResolver);

    server.bind('recipes').to([...sampleRecipes]);
    const repoBinding = createBindingFromClass(RecipeRepository);
    server.add(repoBinding);
    server.add(createBindingFromClass(RecipesDataSource));
    server.add(createBindingFromClass(RecipeService));
    await server.start();
    repo = await server.get<RecipeRepository>(repoBinding.key);
    await repo.start();

    client = supertest(server.httpServer?.url);

    wsClient = await createWsClient(server.httpServer!.url);
    notificationIter = wsClient.iterate({
      operationName: 'AllNotifications',
      query: exampleQuery,
    });
  }

  async function addRecipe() {
    await client
      .post('/graphql')
      .set('content-type', 'application/json')
      .accept('application/json')
      .send({operationName: 'AddRecipe', variables: {}, query: exampleQuery})
      .expect(200);
  }

  async function createWsClient(serverUrl: string): Promise<WsClient> {
    const url = serverUrl.replace(/^http/, 'ws');
    return new Promise((resolve, reject) => {
      const webSocketsClient = createClient({
        webSocketImpl: WebSocket,
        url,
        lazy: false,
      });
      webSocketsClient.on('connected', () => resolve(webSocketsClient));
      webSocketsClient.on('error', err =>
        reject(new Error(`failed to create WS client: ${err}`)),
      );
    });
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
    repo.stop();
  }
});
