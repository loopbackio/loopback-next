// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createClientForHandler, expect, supertest} from '@loopback/testlab';
import {TodoListApplication} from '../../src/application';
import {TodoList} from '../../src/models/';
import {TodoListRepository} from '../../src/repositories/';
import {givenTodoList} from '../helpers';

describe('Application', () => {
  let app: TodoListApplication;
  let client: supertest.SuperTest<supertest.Test>;
  let todoListRepo: TodoListRepository;

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(givenTodoListRepository);
  before(() => {
    client = createClientForHandler(app.requestHandler);
  });

  beforeEach(async () => {
    await todoListRepo.deleteAll();
  });

  it('creates a todoList', async () => {
    const todoList = givenTodoList();
    const response = await client
      .post('/todo-lists')
      .send(todoList)
      .expect(200);
    expect(response.body).to.containDeep(todoList);
    const result = await todoListRepo.findById(response.body.id);
    expect(result).to.containDeep(todoList);
  });

  context('when dealing with multiple persisted todoLists', () => {
    let persistedTodoLists: TodoList[];

    beforeEach(async () => {
      persistedTodoLists = await givenMutlipleTodoListInstances();
    });

    it('counts todoLists', async () => {
      const response = await client
        .get('/todo-lists/count')
        .send()
        .expect(200);
      expect(response.body).to.eql(persistedTodoLists.length);
    });

    it('finds all todoLists', async () => {
      const response = await client
        .get('/todo-lists')
        .send()
        .expect(200);
      expect(response.body).to.containDeep(persistedTodoLists);
    });

    it('updates all todoLists', async () => {
      const patchedColorTodo = {color: 'purple'};
      const response = await client
        .patch('/todo-lists')
        .send(patchedColorTodo)
        .expect(200);
      expect(response.body).to.eql(persistedTodoLists.length);
      const updatedTodoLists = await todoListRepo.find();
      for (const todoList of updatedTodoLists) {
        expect(todoList.color).to.eql(patchedColorTodo.color);
      }
    });
  });

  context('when dealing with a single persisted todoList', () => {
    let persistedTodoList: TodoList;

    beforeEach(async () => {
      persistedTodoList = await givenTodoListInstance();
    });

    it('gets a todoList by ID', async () => {
      const result = await client
        .get(`/todo-lists/${persistedTodoList.id}`)
        .send()
        .expect(200);
      // Remove any undefined properties that cannot be represented in JSON/REST
      const expected = JSON.parse(JSON.stringify(persistedTodoList));
      expect(result.body).to.deepEqual(expected);
    });

    it('updates a todoList by ID', async () => {
      const updatedTodoList = givenTodoList({
        title: 'A different title to the todo list',
      });
      await client
        .patch(`/todo-lists/${persistedTodoList.id}`)
        .send(updatedTodoList)
        .expect(200);
      const result = await todoListRepo.findById(persistedTodoList.id);
      expect(result).to.containEql(updatedTodoList);
    });

    it('deletes a todoList by ID', async () => {
      await client
        .del(`/todo-lists/${persistedTodoList.id}`)
        .send()
        .expect(200);
      await expect(
        todoListRepo.findById(persistedTodoList.id),
      ).to.be.rejectedWith(/no TodoList found with id/);
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

    // Start Application
    await app.start();
  }

  async function givenTodoListRepository() {
    todoListRepo = await app.getRepository(TodoListRepository);
  }

  async function givenTodoListInstance(todoList?: Partial<TodoList>) {
    return await todoListRepo.create(givenTodoList(todoList));
  }

  function givenMutlipleTodoListInstances() {
    return Promise.all([
      givenTodoListInstance(),
      givenTodoListInstance({title: 'so many things to do wow'}),
    ]);
  }
});
