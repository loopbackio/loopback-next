// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {
  TodoListImageRepository,
  TodoListRepository,
  TodoRepository,
} from '../../repositories';
import {
  givenEmptyDatabase,
  givenTodoInstance,
  givenTodoListImageInstance,
  givenTodoListInstance,
  testdb,
} from '../helpers';

describe('TodoListRepository', () => {
  let todoListImageRepo: TodoListImageRepository;
  let todoListRepo: TodoListRepository;
  let todoRepo: TodoRepository;

  before(async () => {
    todoListRepo = new TodoListRepository(
      testdb,
      async () => todoRepo,
      async () => todoListImageRepo,
    );
    todoRepo = new TodoRepository(testdb, async () => todoListRepo);
    todoListImageRepo = new TodoListImageRepository(
      testdb,
      async () => todoListRepo,
    );
  });

  beforeEach(givenEmptyDatabase);

  it('includes Todos in find method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoListRepo.find({
      include: ['todos'],
    });

    expect(toJSON(response)).to.deepEqual([
      {
        ...toJSON(list),
        todos: [toJSON(todo)],
      },
    ]);
  });

  it('includes Todos in findById result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoListRepo.findById(list.id, {
      include: ['todos'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(list),
      todos: [toJSON(todo)],
    });
  });

  it('includes Todos in findOne method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoListRepo.findOne({
      where: {id: list.id},
      include: ['todos'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(list),
      todos: [toJSON(todo)],
    });
  });

  it('includes TodoListImage in find method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const image = await givenTodoListImageInstance(todoListImageRepo, {
      todoListId: list.id,
    });

    const response = await todoListRepo.find({
      include: ['image'],
    });

    expect(toJSON(response)).to.deepEqual([
      {
        ...toJSON(list),
        image: toJSON(image),
      },
    ]);
  });

  it('includes TodoListImage in findById method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const image = await givenTodoListImageInstance(todoListImageRepo, {
      todoListId: list.id,
    });

    const response = await todoListRepo.findById(list.id, {
      include: ['image'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(list),
      image: toJSON(image),
    });
  });

  it('includes TodoListImage in findOne method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const image = await givenTodoListImageInstance(todoListImageRepo, {
      todoListId: list.id,
    });

    const response = await todoListRepo.findOne({
      include: ['image'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(list),
      image: toJSON(image),
    });
  });

  it('includes both Todos and TodoListImage in find method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});
    const image = await givenTodoListImageInstance(todoListImageRepo, {
      todoListId: list.id,
    });

    const response = await todoListRepo.find({
      include: ['image', 'todos'],
    });

    expect(toJSON(response)).to.deepEqual([
      {
        ...toJSON(list),
        image: toJSON(image),
        todos: [toJSON(todo)],
      },
    ]);
  });
});
