// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityNotFoundError} from '@loopback/repository';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import {TodoListApplication} from '../../application';
import {Todo} from '../../models/';
import {TodoRepository} from '../../repositories/';
import {Geocoder} from '../../services';
import {
  aLocation,
  getProxiedGeoCoderConfig,
  givenCachingProxy,
  givenTodo,
  HttpCachingProxy,
  isGeoCoderServiceAvailable,
} from '../helpers';

describe('TodoApplication', () => {
  let app: TodoListApplication;
  let client: Client;
  let todoRepo: TodoRepository;

  let cachingProxy: HttpCachingProxy;
  before(async () => (cachingProxy = await givenCachingProxy()));
  after(() => cachingProxy.stop());

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  let available = true;
  before(async function() {
    // eslint-disable-next-line no-invalid-this
    this.timeout(30 * 1000);
    const service = await app.get<Geocoder>('services.Geocoder');
    available = await isGeoCoderServiceAvailable(service);
  });

  before(givenTodoRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await todoRepo.deleteAll();
  });

  it('creates a todo', async function() {
    // Set timeout to 30 seconds as `post /todos` triggers geocode look up
    // over the internet and it takes more than 2 seconds
    // eslint-disable-next-line no-invalid-this
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

  it('rejects requests with input that contains excluded properties', async () => {
    const todo = givenTodo();
    todo.id = 1;
    await client
      .post('/todos')
      .send(todo)
      .expect(422);
  });

  it('creates an address-based reminder', async function() {
    // eslint-disable-next-line no-invalid-this
    if (!available) return this.skip();
    // Increase the timeout to accommodate slow network connections
    // eslint-disable-next-line no-invalid-this
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

    it('gets a todo by ID', () => {
      return client
        .get(`/todos/${persistedTodo.id}`)
        .send()
        .expect(200, toJSON(persistedTodo));
    });

    it('returns 404 when getting a todo that does not exist', () => {
      return client.get('/todos/99999').expect(404);
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
        .expect(204);
      const result = await todoRepo.findById(persistedTodo.id);
      expect(result).to.containEql(updatedTodo);
    });

    it('returns 404 when replacing a todo that does not exist', () => {
      return client
        .put('/todos/99999')
        .send(givenTodo())
        .expect(404);
    });

    it('updates the todo by ID ', async () => {
      const updatedTodo = givenTodo({
        isComplete: true,
      });
      await client
        .patch(`/todos/${persistedTodo.id}`)
        .send(updatedTodo)
        .expect(204);
      const result = await todoRepo.findById(persistedTodo.id);
      expect(result).to.containEql(updatedTodo);
    });

    it('returns 404 when updating a todo that does not exist', () => {
      return client
        .patch('/todos/99999')
        .send(givenTodo({isComplete: true}))
        .expect(404);
    });

    it('deletes the todo', async () => {
      await client
        .del(`/todos/${persistedTodo.id}`)
        .send()
        .expect(204);
      await expect(todoRepo.findById(persistedTodo.id)).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    it('returns 404 when deleting a todo that does not exist', async () => {
      await client.del(`/todos/99999`).expect(404);
    });
  });

  it('queries todos with a filter', async () => {
    await givenTodoInstance({title: 'wake up', isComplete: true});

    const todoInProgress = await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });

    await client
      .get('/todos')
      .query({filter: {where: {isComplete: false}}})
      .expect(200, [toJSON(todoInProgress)]);
  });

  it('exploded filter conditions work', async () => {
    await givenTodoInstance({title: 'wake up', isComplete: true});
    await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });

    const response = await client.get('/todos').query('filter[limit]=2');
    expect(response.body).to.have.length(2);
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
      rest: givenHttpServerConfig(),
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
    return todoRepo.create(givenTodo(todo));
  }
});
