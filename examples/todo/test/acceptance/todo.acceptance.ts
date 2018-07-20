// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createClientForHandler, expect, supertest} from '@loopback/testlab';
import {TodoListApplication} from '../../src/application';
import {Todo} from '../../src/models/';
import {TodoRepository} from '../../src/repositories/';
import {
  HttpCachingProxy,
  aLocation,
  getProxiedGeoCoderConfig,
  givenCachingProxy,
  givenTodo,
} from '../helpers';

describe('Application', () => {
  let app: TodoListApplication;
  let client: supertest.SuperTest<supertest.Test>;
  let todoRepo: TodoRepository;

  let cachingProxy: HttpCachingProxy;
  before(async () => (cachingProxy = await givenCachingProxy()));
  after(() => cachingProxy.stop());

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(givenTodoRepository);
  before(() => {
    client = createClientForHandler(app.requestHandler);
  });

  beforeEach(async () => {
    await todoRepo.deleteAll();
  });

  it('creates a todo', async function() {
    // Set timeout to 30 seconds as `post /todos` triggers geocode look up
    // over the internet and it takes more than 2 seconds
    // tslint:disable-next-line:no-invalid-this
    this.timeout(30000);
    const todo = givenTodo();
    const response = await client
      .post('/todos')
      .send(todo)
      .expect(200);
    expect(response.body).to.containDeep(todo);
    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containDeep(todo);
  });

  it('rejects requests to create a todo with no title', async () => {
    const todo = givenTodo();
    delete todo.title;
    await client
      .post('/todos')
      .send(todo)
      .expect(422);
  });

  it('creates an address-based reminder', async function() {
    // Increase the timeout to accommodate slow network connections
    // tslint:disable-next-line:no-invalid-this
    this.timeout(30000);

    const todo = givenTodo({remindAtAddress: aLocation.address});
    const response = await client
      .post('/todos')
      .send(todo)
      .expect(200);
    todo.remindAtGeo = aLocation.geostring;

    expect(response.body).to.containEql(todo);

    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containEql(todo);
  });

  context('when dealing with a single persisted todo', () => {
    let persistedTodo: Todo;

    beforeEach(async () => {
      persistedTodo = await givenTodoInstance();
    });

    it('gets a todo by ID', async () => {
      const result = await client
        .get(`/todos/${persistedTodo.id}`)
        .send()
        .expect(200);
      // Remove any undefined properties that cannot be represented in JSON/REST
      const expected = JSON.parse(JSON.stringify(persistedTodo));
      expect(result.body).to.deepEqual(expected);
    });

    it('replaces the todo by ID', async () => {
      const updatedTodo = givenTodo({
        title: 'DO SOMETHING AWESOME',
        desc: 'It has to be something ridiculous',
        isComplete: true,
      });
      await client
        .put(`/todos/${persistedTodo.id}`)
        .send(updatedTodo)
        .expect(200);
      const result = await todoRepo.findById(persistedTodo.id);
      expect(result).to.containEql(updatedTodo);
    });

    it('updates the todo by ID ', async () => {
      const updatedTodo = givenTodo({
        title: 'DO SOMETHING AWESOME',
        isComplete: true,
      });
      await client
        .patch(`/todos/${persistedTodo.id}`)
        .send(updatedTodo)
        .expect(200);
      const result = await todoRepo.findById(persistedTodo.id);
      expect(result).to.containEql(updatedTodo);
    });

    it('deletes the todo', async () => {
      await client
        .del(`/todos/${persistedTodo.id}`)
        .send()
        .expect(200);
      await expect(todoRepo.findById(persistedTodo.id)).to.be.rejectedWith(
        /no Todo found with id/,
      );
    });
  });

  /*
   ============================================================================
   TEST HELPERS
   These functions help simplify setup of your test fixtures so that your tests
   can:
   - operate on a "clean" environment each time (a fresh in-memory database)
   - avoid polluting the test with large quantities of setup logic to keep
   them clear and easy to read
   - keep them DRY (who wants to write the same stuff over and over?)
   ============================================================================
   */

  async function givenRunningApplicationWithCustomConfiguration() {
    app = new TodoListApplication({
      rest: {
        port: 0,
      },
    });

    await app.boot();

    /**
     * Override default config for DataSource for testing so we don't write
     * test data to file when using the memory connector.
     */
    app.bind('datasources.config.db').to({
      name: 'db',
      connector: 'memory',
    });

    // Override Geocoder datasource to use a caching proxy to speed up tests.
    app
      .bind('datasources.config.geocoder')
      .to(getProxiedGeoCoderConfig(cachingProxy));

    // Start Application
    await app.start();
  }

  async function givenTodoRepository() {
    todoRepo = await app.getRepository(TodoRepository);
  }

  async function givenTodoInstance(todo?: Partial<Todo>) {
    return await todoRepo.create(givenTodo(todo));
  }
});
