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
  givenTodoListInstance,
  testdb,
} from '../helpers';

describe('TodoRepository', () => {
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
  });

  beforeEach(givenEmptyDatabase);

  it('includes TodoList in find method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoRepo.find({
      include: ['todoList'],
    });

    expect(toJSON(response)).to.deepEqual([
      {
        ...toJSON(todo),
        todoList: toJSON(list),
      },
    ]);
  });

  it('includes TodoList in findById result', async () => {
    const list = await givenTodoListInstance(todoListRepo, {});
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoRepo.findById(todo.id, {
      include: ['todoList'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(todo),
      todoList: toJSON(list),
    });
  });

  it('includes TodoList in findOne method result', async () => {
    const list = await givenTodoListInstance(todoListRepo);
    const todo = await givenTodoInstance(todoRepo, {todoListId: list.id});

    const response = await todoRepo.findOne({
      include: ['todoList'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(todo),
      todoList: toJSON(list),
    });
  });
});
