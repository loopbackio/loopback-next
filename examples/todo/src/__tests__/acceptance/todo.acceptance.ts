// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityNotFoundError} from '@loopback/repository';
import {Request, Response, RestBindings} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import morgan from 'morgan';
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

  before(async function (this: Mocha.Context) {
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

  it('creates a todo', async function (this: Mocha.Context) {
    // Set timeout to 30 seconds as `post /todos` triggers geocode look up
    // over the internet and it takes more than 2 seconds
    this.timeout(30000);
    const todo = givenTodo();
    const response = await client.post('/todos').send(todo).expect(200);
    expect(response.body).to.containDeep(todo);
    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containDeep(todo);
  });

  it('creates a todo with arbitrary property', async function () {
    const todo = givenTodo({tag: {random: 'random'}});
    const response = await client.post('/todos').send(todo).expect(200);
    expect(response.body).to.containDeep(todo);
    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containDeep(todo);
  });

  it('rejects requests to create a todo with no title', async () => {
    const todo: Partial<Todo> = givenTodo();
    delete todo.title;
    await client.post('/todos').send(todo).expect(422);
  });

  it('rejects requests with input that contains excluded properties', async () => {
    const todo = givenTodo();
    todo.id = 1;
    await client.post('/todos').send(todo).expect(422);
  });

  it('creates an address-based reminder', async function (this: Mocha.Context) {
    if (!available) return this.skip();
    // Increase the timeout to accommodate slow network connections
    this.timeout(30000);

    const todo = givenTodo({remindAtAddress: aLocation.address});
    const response = await client.post('/todos').send(todo).expect(200);
    todo.remindAtGeo = aLocation.geostring;

    expect(response.body).to.containEql(todo);

    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containEql(todo);
  });

  it('returns 400 if it cannot find an address', async function (this: Mocha.Context) {
    if (!available) return this.skip();
    // Increase the timeout to accommodate slow network connections
    this.timeout(30000);

    const todo = givenTodo({remindAtAddress: 'this address does not exist'});
    const response = await client.post('/todos').send(todo).expect(400);

    expect(response.body.error.message).to.eql(
      'Address not found: this address does not exist',
    );
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
      return client.put('/todos/99999').send(givenTodo()).expect(404);
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
      await client.del(`/todos/${persistedTodo.id}`).send().expect(204);
      await expect(todoRepo.findById(persistedTodo.id)).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    it('returns 404 when deleting a todo that does not exist', async () => {
      await client.del(`/todos/99999`).expect(404);
    });

    it('rejects request with invalid keys - constructor.prototype', async () => {
      const res = await client
        .get(
          '/todos?filter={"offset":0,"limit":100,"skip":0,' +
            '"where":{"constructor.prototype":{"toString":"def"}},' +
            '"fields":{"title":true,"id":true}}',
        )
        .expect(400);
      expect(res.body?.error).to.containEql({
        statusCode: 400,
        name: 'BadRequestError',
        code: 'INVALID_PARAMETER_VALUE',
        details: {
          syntaxError:
            'JSON string cannot contain "constructor.prototype" key.',
        },
      });
    });

    it('rejects request with invalid keys - __proto__', async () => {
      const res = await client
        .get(
          '/todos?filter={"offset":0,"limit":100,"skip":0,' +
            '"where":{"__proto__":{"toString":"def"}},' +
            '"fields":{"title":true,"id":true}}',
        )
        .expect(400);
      expect(res.body?.error).to.containEql({
        statusCode: 400,
        name: 'BadRequestError',
        code: 'INVALID_PARAMETER_VALUE',
        details: {
          syntaxError: 'JSON string cannot contain "__proto__" key.',
        },
      });
    });

    it('rejects request with prohibited keys - badKey', async () => {
      const res = await client
        .get(
          '/todos?filter={"offset":0,"limit":100,"skip":0,' +
            '"where":{"badKey":{"toString":"def"}},' +
            '"fields":{"title":true,"id":true}}',
        )
        .expect(400);
      expect(res.body?.error).to.containEql({
        statusCode: 400,
        name: 'BadRequestError',
        code: 'INVALID_PARAMETER_VALUE',
        details: {
          syntaxError: 'JSON string cannot contain "badKey" key.',
        },
      });
    });
  });

  context('allows logging to be reconfigured', () => {
    it('logs http requests', async () => {
      const logs: string[] = [];
      const logToArray = (str: string) => {
        logs.push(str);
      };
      app.configure<morgan.Options<Request, Response>>('middleware.morgan').to({
        stream: {
          write: logToArray,
        },
      });
      await client.get('/todos');
      expect(logs.length).to.eql(1);
      expect(logs[0]).to.match(/"GET \/todos HTTP\/1\.1" 200 - "-"/);
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

  it('queries todos with string-based order filter', async () => {
    const todoInProgress = await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });

    const todoCompleted = await givenTodoInstance({
      title: 'wake up',
      isComplete: true,
    });

    const todoCompleted2 = await givenTodoInstance({
      title: 'go to work',
      isComplete: true,
    });

    await client
      .get('/todos')
      .query({filter: {order: 'title DESC'}})
      .expect(200, toJSON([todoCompleted, todoCompleted2, todoInProgress]));
  });

  it('queries todos with array-based order filter', async () => {
    const todoInProgress = await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });

    const todoCompleted = await givenTodoInstance({
      title: 'wake up',
      isComplete: true,
    });

    const todoCompleted2 = await givenTodoInstance({
      title: 'go to work',
      isComplete: true,
    });

    await client
      .get('/todos')
      .query({filter: {order: ['title DESC']}})
      .expect(200, toJSON([todoCompleted, todoCompleted2, todoInProgress]));
  });

  it('queries todos with exploded string-based order filter', async () => {
    const todoInProgress = await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });

    const todoCompleted = await givenTodoInstance({
      title: 'wake up',
      isComplete: true,
    });

    const todoCompleted2 = await givenTodoInstance({
      title: 'go to work',
      isComplete: true,
    });

    await client
      .get('/todos')
      .query('filter[order]=title%20DESC')
      .expect(200, [
        toJSON(todoCompleted),
        toJSON(todoCompleted2),
        toJSON(todoInProgress),
      ]);
  });

  it('queries todos with exploded array-based fields filter', async () => {
    await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });
    await client
      .get('/todos')
      .query('filter[fields][0]=title')
      .expect(200, toJSON([{title: 'go to sleep'}]));
  });

  it('queries todos with exploded array-based order filter', async () => {
    const todoInProgress = await givenTodoInstance({
      title: 'go to sleep',
      isComplete: false,
    });

    const todoCompleted = await givenTodoInstance({
      title: 'wake up',
      isComplete: true,
    });

    const todoCompleted2 = await givenTodoInstance({
      title: 'go to work',
      isComplete: true,
    });

    await client
      .get('/todos')
      .query('filter[order][0]=title+DESC')
      .expect(200, toJSON([todoCompleted, todoCompleted2, todoInProgress]));
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

    app.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
      validation: {
        prohibitedKeys: ['badKey'],
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
    return todoRepo.create(givenTodo(todo));
  }
});
