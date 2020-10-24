// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-list-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  toJSON,
} from '@loopback/testlab';
import {TodoListApplication} from '../../application';
import {Todo, TodoList} from '../../models/';
import {TodoListRepository, TodoRepository} from '../../repositories/';
import {givenTodo, givenTodoList, givenTodoWithoutId} from '../helpers';

describe('TodoListApplication', () => {
  let app: TodoListApplication;
  let client: Client;
  let todoRepo: TodoRepository;
  let todoListRepo: TodoListRepository;

  let persistedTodoList: TodoList;

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(givenTodoRepository);
  before(givenTodoListRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await todoRepo.deleteAll();
    await todoListRepo.deleteAll();
  });

  beforeEach(async () => {
    persistedTodoList = await givenTodoListInstance();
  });

  it('creates todo for a todoList', async () => {
    const todo = givenTodoWithoutId({todoListId: undefined});
    const response = await client
      .post(`/todo-lists/${persistedTodoList.id}/todos`)
      .send(todo)
      .expect(200);

    const expected = {
      ...todo,
      todoListId: persistedTodoList.id,
    };
    expect(response.body).to.containEql(expected);

    const created = await todoRepo.findById(response.body.id);

    expect(toJSON(created)).to.deepEqual({id: response.body.id, ...expected});
  });

  context('when dealing with multiple persisted Todos', () => {
    let notMyTodo: Todo;
    let myTodos: Todo[];

    beforeEach(async () => {
      notMyTodo = await givenTodoInstance({
        title: 'someone else does a thing',
      });
      myTodos = await Promise.all([
        givenTodoInstanceOfTodoList(persistedTodoList.id),
        givenTodoInstanceOfTodoList(persistedTodoList.id, {
          title: 'another thing needs doing',
        }),
      ]);
    });

    it('finds todos for a todoList', async () => {
      const response = await client
        .get(`/todo-lists/${persistedTodoList.id}/todos`)
        .send()
        .expect(200);

      expect(response.body)
        .to.containDeep(myTodos)
        .and.not.containEql(notMyTodo.toJSON());
    });

    // https://github.com/strongloop/loopback-next/issues/2495
    it('finds todos for a todoList more than once', async () => {
      await client
        .get(`/todo-lists/${persistedTodoList.id}/todos`)
        .send()
        .expect(200);

      await client
        .get(`/todo-lists/${persistedTodoList.id}/todos`)
        .send()
        .expect(200);
    });

    it('updates todos for a todoList', async () => {
      const patchedIsCompleteTodo = {isComplete: true};
      const response = await client
        .patch(`/todo-lists/${persistedTodoList.id}/todos`)
        .send(patchedIsCompleteTodo)
        .expect(200);

      expect(response.body.count).to.eql(myTodos.length);
      const updatedTodos = await todoListRepo
        .todos(persistedTodoList.id)
        .find();
      const notUpdatedTodo = await todoRepo.findById(notMyTodo.id);
      for (const todo of updatedTodos) {
        expect(todo.toJSON()).to.containEql(patchedIsCompleteTodo);
      }
      expect(notUpdatedTodo.toJSON()).to.not.containEql(patchedIsCompleteTodo);
    });

    it('updates todos matching "where" condition', async () => {
      await todoRepo.deleteAll();
      const wip = await givenTodoInstanceOfTodoList(persistedTodoList.id, {
        desc: 'not started yet',
        isComplete: false,
      });
      const done = await givenTodoInstanceOfTodoList(persistedTodoList.id, {
        desc: 'done done',
        isComplete: true,
      });

      const response = await client
        .patch(`/todo-lists/${persistedTodoList.id}/todos`)
        .query({where: {isComplete: false}})
        .send({desc: 'work in progress'})
        .expect(200);
      expect(response.body.count).to.equal(1);

      // the matched Todo was updated
      expect(await todoRepo.findById(wip.id)).to.have.property(
        'desc',
        'work in progress',
      );

      // the other Todo was not modified
      expect(await todoRepo.findById(done.id)).to.have.property(
        'desc',
        'done done',
      );
    });

    it('deletes all todos in a todoList', async () => {
      await client
        .del(`/todo-lists/${persistedTodoList.id}/todos`)
        .send()
        .expect(200);

      const myDeletedTodos = await todoListRepo
        .todos(persistedTodoList.id)
        .find();
      const notDeletedTodo = await todoRepo.findById(notMyTodo.id);
      expect(myDeletedTodos).to.be.empty();
      expect(notDeletedTodo).to.eql(notMyTodo);
    });

    it('deletes selected todos in a todoList', async () => {
      await todoListRepo.todos(persistedTodoList.id).delete();
      await givenTodoInstanceOfTodoList(persistedTodoList.id, {
        title: 'wip',
        isComplete: false,
      });
      await givenTodoInstanceOfTodoList(persistedTodoList.id, {
        title: 'done',
        isComplete: true,
      });

      const response = await client
        .del(`/todo-lists/${persistedTodoList.id}/todos`)
        .query({where: {isComplete: true}})
        .expect(200);

      expect(response.body.count).to.equal(1);

      const allRemainingTodos = await todoRepo.find();
      expect(allRemainingTodos.map(t => t.title).sort()).to.deepEqual(
        ['wip', notMyTodo.title].sort(),
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

    // Start Application
    await app.start();
  }

  async function givenTodoRepository() {
    todoRepo = await app.getRepository(TodoRepository);
  }

  async function givenTodoListRepository() {
    todoListRepo = await app.getRepository(TodoListRepository);
  }

  async function givenTodoInstance(todo?: Partial<Todo>) {
    return todoRepo.create(givenTodo(todo));
  }

  async function givenTodoInstanceOfTodoList(
    id: typeof Todo.prototype.id,
    todo?: Partial<Todo>,
  ) {
    const data: Partial<Todo> = givenTodo(todo);
    delete data.todoListId;
    return todoListRepo.todos(id).create(data);
  }

  async function givenTodoListInstance(todoList?: Partial<TodoList>) {
    return todoListRepo.create(givenTodoList(todoList));
  }
});
