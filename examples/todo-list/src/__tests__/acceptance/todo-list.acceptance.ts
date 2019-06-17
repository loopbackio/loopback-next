// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityNotFoundError} from '@loopback/repository';
import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {TodoListApplication} from '../../application';
import {TodoList} from '../../models/';
import {TodoListRepository, TodoRepository} from '../../repositories/';
import {
  givenRunningApplicationWithCustomConfiguration,
  givenTodoInstance,
  givenTodoList,
  givenTodoListInstance,
  givenTodoRepositories,
} from '../helpers';

describe('TodoListApplication', () => {
  let app: TodoListApplication;
  let client: Client;
  let todoRepo: TodoRepository;
  let todoListRepo: TodoListRepository;

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(async () => {
    ({todoRepo, todoListRepo} = await givenTodoRepositories(app));
  });

  before(() => {
    client = createRestAppClient(app);
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
      expect(response.body.count).to.eql(persistedTodoLists.length);
    });

    it('counts a subset of todoLists', async () => {
      const response = await client
        .get('/todo-lists/count')
        .query({where: {title: 'so many things to do wow'}})
        .expect(200);
      expect(response.body.count).to.equal(1);
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
      expect(response.body.count).to.eql(persistedTodoLists.length);
      const updatedTodoLists = await todoListRepo.find();
      for (const todoList of updatedTodoLists) {
        expect(todoList.color).to.eql(patchedColorTodo.color);
      }
    });

    it('updates selected todoLists', async () => {
      await todoListRepo.deleteAll();
      await givenTodoListInstance(todoListRepo, {
        title: 'red-list',
        color: 'red',
      });
      await givenTodoListInstance(todoListRepo, {
        title: 'green-list',
        color: 'green',
      });

      const response = await client
        .patch('/todo-lists')
        .query({where: {color: 'red'}})
        .send({color: 'purple'})
        .expect(200);
      expect(response.body.count).to.eql(1);

      // the matched TodoList was updated
      expect(await todoListRepo.findByTitle('red-list')).to.have.property(
        'color',
        'purple',
      );

      // the other TodoList was not modified
      expect(await todoListRepo.findByTitle('green-list')).to.have.property(
        'color',
        'green',
      );
    });
  });

  context('when dealing with a single persisted todoList', () => {
    let persistedTodoList: TodoList;

    beforeEach(async () => {
      persistedTodoList = await givenTodoListInstance(todoListRepo);
    });

    it('gets a todoList by ID', async () => {
      const result = await client
        .get(`/todo-lists/${persistedTodoList.id}`)
        .send()
        .expect(200);
      const expected = toJSON(persistedTodoList);
      expect(result.body).to.deepEqual(expected);
    });

    it('returns 404 when getting a todo-list that does not exist', () => {
      return client.get('/todo-lists/99999').expect(404);
    });

    it('updates a todoList by ID', async () => {
      const updatedTodoList = givenTodoList({
        title: 'A different title to the todo list',
      });
      await client
        .patch(`/todo-lists/${persistedTodoList.id}`)
        .send(updatedTodoList)
        .expect(204);
      const result = await todoListRepo.findById(persistedTodoList.id);
      expect(result).to.containEql(updatedTodoList);
    });

    it('returns 404 when updating a todo-list that does not exist', () => {
      return client
        .patch('/todo-lists/99999')
        .send(givenTodoList())
        .expect(404);
    });

    it('deletes a todoList by ID', async () => {
      await client
        .del(`/todo-lists/${persistedTodoList.id}`)
        .send()
        .expect(204);
      await expect(
        todoListRepo.findById(persistedTodoList.id),
      ).to.be.rejectedWith(EntityNotFoundError);
    });
  });

  it('queries todo-lists with a filter', async () => {
    await givenTodoListInstance(todoListRepo, {title: 'day', color: 'white'});

    const listInBlack = await givenTodoListInstance(todoListRepo, {
      title: 'night',
      color: 'black',
    });

    await client
      .get('/todo-lists')
      .query({filter: {where: {color: 'black'}}})
      .expect(200, [toJSON(listInBlack)]);
  });

  it('includes Todos in query result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});
    const filter = JSON.stringify({include: [{relation: 'todos'}]});

    const response = await client.get('/todo-lists').query({filter: filter});

    expect(response.body).to.have.length(1);
    expect(response.body[0]).to.deepEqual({
      ...toJSON(list),
      todos: [toJSON(todo)],
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

  function givenMutlipleTodoListInstances() {
    return Promise.all([
      givenTodoListInstance(todoListRepo),
      givenTodoListInstance(todoListRepo, {title: 'so many things to do wow'}),
    ]);
  }
});
