// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityNotFoundError} from '@loopback/repository';
import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {TodoListApplication} from '../../application';
import {Todo} from '../../models/';
import {TodoListRepository, TodoRepository} from '../../repositories/';
import {
  givenRunningApplicationWithCustomConfiguration,
  givenTodo,
  givenTodoInstance,
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
    await todoRepo.deleteAll();
  });

  it('creates a todo', async function () {
    const todo = givenTodo();
    const response = await client.post('/todos').send(todo).expect(200);
    expect(response.body).to.containDeep(todo);
    const result = await todoRepo.findById(response.body.id);
    expect(result).to.containDeep(todo);
  });

  it('gets a count of todos', async function () {
    await givenTodoInstance(todoRepo, {
      title: 'say hello',
      desc: 'formal greeting',
    });
    await givenTodoInstance(todoRepo, {
      title: 'say goodbye',
      desc: 'formal farewell',
    });
    await client.get('/todos/count').expect(200, {count: 2});
  });

  it('rejects requests to create a todo with no title', async () => {
    const todo: Partial<Todo> = givenTodo();
    delete todo.title;
    await client.post('/todos').send(todo).expect(422);
  });

  context('when dealing with a single persisted todo', () => {
    let persistedTodo: Todo;

    beforeEach(async () => {
      persistedTodo = await givenTodoInstance(todoRepo);
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
        title: 'DO SOMETHING AWESOME',
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
      return client.patch('/todos/99999').send(givenTodo()).expect(404);
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

    it('returns the owning todo-list', async () => {
      const list = await givenTodoListInstance(todoListRepo);
      const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

      await client.get(`/todos/${todo.id}/todo-list`).expect(200, toJSON(list));
    });
  });

  it('queries todos with a filter', async () => {
    await givenTodoInstance(todoRepo, {title: 'wake up', isComplete: true});

    const todoInProgress = await givenTodoInstance(todoRepo, {
      title: 'go to sleep',
      isComplete: false,
    });

    await client
      .get('/todos')
      .query({filter: {where: {isComplete: false}}})
      .expect(200, [toJSON(todoInProgress)]);
  });

  it('updates todos using a filter', async () => {
    await givenTodoInstance(todoRepo, {
      title: 'hello',
      desc: 'common greeting',
      isComplete: false,
    });
    await givenTodoInstance(todoRepo, {
      title: 'goodbye',
      desc: 'common farewell',
      isComplete: false,
    });
    await client
      .patch('/todos')
      .query({where: {title: 'goodbye'}})
      .send({isComplete: true})
      .expect(200, {count: 1});
  });

  it('includes TodoList in query result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});
    const filter = JSON.stringify({include: [{relation: 'todoList'}]});

    const response = await client.get('/todos').query({filter: filter});

    expect(response.body).to.have.length(1);
    expect(response.body[0]).to.deepEqual({
      ...toJSON(todo),
      todoList: toJSON(list),
    });
  });
});
