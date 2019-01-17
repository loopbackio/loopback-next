// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServerConfig} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import {CompatMixin, PersistedModelClass} from '../..';

describe('v3compat (acceptance)', () => {
  class CompatApp extends CompatMixin(RestApplication) {}

  let app: CompatApp;
  let client: Client;

  beforeEach(givenApplication);

  context('simple PersistedModel', () => {
    let Todo: PersistedModelClass;

    beforeEach(function setupTodoModel() {
      const v3app = app.v3compat;

      Todo = v3app.registry.createModel<PersistedModelClass>('Todo', {
        title: {type: String, required: true},
      });
      v3app.dataSource('db', {connector: 'memory'});
      v3app.model(Todo, {dataSource: 'db'});
    });

    beforeEach(givenClient);
    afterEach(stopServers);

    it('custom models inherit from PersistedModel by default', () => {
      expect(Todo.base.modelName).to.equal('PersistedModel');
    });

    it('defines remote methods', () => {
      const methodNames = Todo.sharedClass.methods().map(m => m.stringName);
      expect(methodNames).to.deepEqual([
        'Todo.create',
        'Todo.find',
        'Todo.findById',
        // TODO: add other CRUD methods
      ]);
    });

    it('exposes Todo.find() method', async () => {
      const todos = await Todo.find();
      expect(todos).to.deepEqual([]);
    });

    it('creates a new todo', async () => {
      const data = {
        title: 'finish compat layer',
      };
      const created = await Todo.create(data);
      const expected = Object.assign({id: 1}, data);
      expect(toJSON(created)).to.deepEqual(expected);

      const found = await Todo.findById(created.id);
      expect(toJSON(found)).to.deepEqual(expected);
    });

    it.skip('provides getId() API', () => {
      const todo = new Todo({id: 1, title: 'a-title'});
      expect(todo.getId()).to.equal(1);
    });

    it('provides Model.app.models.AnotherModel API', () => {
      expect(Object.keys(Todo)).to.containEql('app');
      expect(Object.keys(Todo.app)).to.containEql('models');
      expect(Object.keys(Todo.app.models)).to.containEql('Todo');
      expect(Todo.app.models.Todo).to.equal(Todo);
    });

    it('exposes "GET /api/Todos" endpoint', () => {
      return client.get('/api/Todos').expect(200, []);
    });

    it('exposes "GET /api/Todos/:id" endpoint', async () => {
      const created = await Todo.create({title: 'a task'});
      await client.get(`/api/Todos/${created.id}`).expect(200, toJSON(created));
    });

    it('supports ?filter argument encoded as deep-object', async () => {
      const list = await Promise.all([
        Todo.create({title: 'first task'}),
        Todo.create({title: 'second task'}),
      ]);
      await client
        .get('/api/Todos')
        .query({'filter[where][title]': 'first task'})
        .expect(200, [toJSON(list[0])]);
    });

    it('supports ?filter argument encoded as JSON', async () => {
      const list = await Promise.all([
        Todo.create({title: 'first task'}),
        Todo.create({title: 'second task'}),
      ]);
      await client
        .get('/api/Todos')
        .query({filter: JSON.stringify({where: {title: 'second task'}})})
        .expect(200, [toJSON(list[1])]);
    });

    // TODO
    it.skip('supports POST /api/Todos');
  });

  async function givenApplication() {
    const rest: RestServerConfig = Object.assign({}, givenHttpServerConfig());
    app = new (CompatMixin(RestApplication))({rest});
  }

  async function givenClient() {
    await app.start();
    client = createRestAppClient(app);
  }

  async function stopServers() {
    if (app) await app.stop();
  }
});
