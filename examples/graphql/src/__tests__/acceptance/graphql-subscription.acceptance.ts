// Copyright LoopBack contributors 2024
// Node module: @loopback/example-graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createPubSub} from '@graphql-yoga/subscription';
import {Application, createBindingFromClass} from '@loopback/core';
import {GraphQLBindings, GraphQLServer} from '@loopback/graphql';
import {
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  supertest,
} from '@loopback/testlab';
import {createClient, Client as WsClient} from 'graphql-ws';
import WebSocket from 'ws';
import {GraphqlDemoApplication} from '../../application';
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
    await addRecipe(client);
  });

  after('unsubscribe and stop server', async function () {
    await unsubscribe(wsClient, notificationIter);
    await stopServer();
  });

  it('should receive notification', async () =>
    receiveNotification(notificationIter));

  async function setupServerAndSubscribe() {
    server = new GraphQLServer({
      host: '127.0.0.1',
      port: 0,
    });
    server.resolver(RecipeResolver);

    server.bind('recipes').to([...sampleRecipes]);
    const repoBinding = createBindingFromClass(RecipeRepository);
    server.add(repoBinding);
    server.bind(GraphQLBindings.PUB_SUB).to(createPubSub());
    server.add(createBindingFromClass(RecipesDataSource));
    server.add(createBindingFromClass(RecipeService));
    await server.start();
    repo = await server.get<RecipeRepository>(repoBinding.key);
    await repo.start();

    client = supertest(server.httpServer?.url);
    wsClient = await createWsClient(server.httpServer!.url);
    notificationIter = subscribe(wsClient);
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
    repo.stop();
  }
});

describe('GraphQL application subscription', () => {
  let server: GraphQLServer;
  let app: Application;
  let client: supertest.SuperTest<supertest.Test>;
  let wsClient: WsClient;
  let notificationIter: AsyncIterableIterator<unknown>;

  before('setup app and subscribe', async function () {
    await setupAppAndSubscribe();
    await addRecipe(client);
  });

  after('unsubscribe and stop server', async function () {
    await unsubscribe(wsClient, notificationIter);
    await stopApp();
  });

  it('should receive notification', async () =>
    receiveNotification(notificationIter));

  async function setupAppAndSubscribe() {
    app = new Application();
    const serverBinding = app.server(GraphQLServer);
    app.configure(serverBinding.key).to({host: '127.0.0.1', port: 0});
    server = await app.getServer(GraphQLServer);
    server.resolver(RecipeResolver);

    app.bind('recipes').to([...sampleRecipes]);
    const repoBinding = createBindingFromClass(RecipeRepository);
    app.add(repoBinding);
    server.bind(GraphQLBindings.PUB_SUB).to(createPubSub());
    app.add(createBindingFromClass(RecipesDataSource));
    app.add(createBindingFromClass(RecipeService));
    await app.start();

    client = supertest(server.httpServer?.url);
    wsClient = await createWsClient(server.httpServer!.url);
    notificationIter = subscribe(wsClient);
  }

  async function stopApp() {
    if (!app) return;
    await app.stop();
  }
});

describe('GraphQL as middleware subscription', () => {
  let app: GraphqlDemoApplication;
  let client: supertest.SuperTest<supertest.Test>;
  let wsClient: WsClient;
  let notificationIter: AsyncIterableIterator<unknown>;

  before('setup app and subscribe', async function () {
    await setupAppWithMiddlewareAndSubscribe();
    await addRecipe(client);
  });

  after('unsubscribe and stop server', async function () {
    await unsubscribe(wsClient, notificationIter);
    await stopApp();
  });

  it('should receive notification', async () =>
    receiveNotification(notificationIter));

  async function setupAppWithMiddlewareAndSubscribe() {
    app = new GraphqlDemoApplication({
      rest: givenHttpServerConfig(),
      graphql: {asMiddlewareOnly: true},
    });
    await app.boot();
    await app.start();

    client = createRestAppClient(app);
    wsClient = await createWsClient(
      `${app.restServer.rootUrl ?? app.restServer.url!}`,
    );
    notificationIter = subscribe(wsClient);
  }

  async function stopApp() {
    await app?.stop();
  }
});

async function addRecipe(client: supertest.SuperTest<supertest.Test>) {
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
    webSocketsClient.on('error', err => {
      process.stderr.write(String(err));
      reject(new Error(`failed to create WS client: ${JSON.stringify(err)}`));
    });
  });
}

function subscribe(wsClient: WsClient) {
  return wsClient.iterate({
    operationName: 'AllNotifications',
    query: exampleQuery,
  });
}

async function unsubscribe(
  wsClient: WsClient,
  notificationIter: AsyncIterableIterator<unknown>,
): Promise<void> {
  await notificationIter.return?.();
  await wsClient.dispose();
}

async function receiveNotification(
  notificationIter: AsyncIterableIterator<unknown>,
) {
  const {value: notification} = await notificationIter.next();
  expect(notification.data.recipeCreated).to.containEql({
    id: '4',
    numberInCollection: 4,
  });
}
