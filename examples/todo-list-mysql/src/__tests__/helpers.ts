// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-list-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {givenHttpServerConfig} from '@loopback/testlab';
import {TodoListApplication} from '../application';
import {Todo, TodoList, TodoListImage} from '../models';
import {
  TodoListImageRepository,
  TodoListRepository,
  TodoRepository,
} from '../repositories';

/*
 ==============================================================================
 HELPER FUNCTIONS
 If you find yourself creating the same helper functions across different
 test files, then extracting those functions into helper modules is an easy
 way to reduce duplication.

 Other tips:

 - Using the super awesome Partial<T> type in conjunction with Object.assign
   means you can:
   * customize the object you get back based only on what's important
   to you during a particular test
   * avoid writing test logic that is brittle with respect to the properties
   of your object
 - Making the input itself optional means you don't need to do anything special
   for tests where the particular details of the input don't matter.
 ==============================================================================
 */

/**
 * Generate a complete Todo object for use with tests.
 * @param todo - A partial (or complete) Todo object.
 */
export function givenTodo(todo?: Partial<Todo>) {
  const data = Object.assign(
    {
      title: 'do a thing',
      desc: 'There are some things that need doing',
      isComplete: false,
      todoListId: 999,
    },
    todo,
  );
  return new Todo(data);
}

export function givenTodoWithoutId(todo?: Partial<Todo>): Omit<Todo, 'id'> {
  return givenTodo(todo);
}

/**
 * Generate a complete TodoList object for use with tests
 * @param todoList - A partial (or complete) TodoList object.
 */
export function givenTodoList(todoList?: Partial<TodoList>) {
  const data = Object.assign(
    {
      title: 'List of things',
    },
    todoList,
  );
  return new TodoList(data);
}

/**
 * Generate a complete TodoListImage object for use with tests.
 * @param todoListImage - A partial (or complete) TodoListImage object.
 */
export function givenTodoListImage(
  todoListImage?: Partial<TodoListImage>,
): Omit<TodoListImage, 'id'> {
  const data = Object.assign(
    {
      value: 'A picture of a basket of fruits',
    },
    todoListImage,
  );
  return new TodoListImage(data);
}

export async function givenRunningApplicationWithCustomConfiguration() {
  const app = new TodoListApplication({
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
  return app;
}

export async function givenTodoRepositories(app: TodoListApplication) {
  const todoRepo = await app.getRepository(TodoRepository);
  const todoListRepo = await app.getRepository(TodoListRepository);
  return {todoRepo, todoListRepo};
}

export async function givenTodoListRepositories(app: TodoListApplication) {
  const todoListRepo = await app.getRepository(TodoListRepository);
  const todoListImageRepo = await app.getRepository(TodoListImageRepository);
  return {todoListRepo, todoListImageRepo};
}

export async function givenTodoInstance(
  todoRepo: TodoRepository,
  todo?: Partial<Todo>,
) {
  return todoRepo.create(givenTodo(todo));
}

export async function givenTodoListInstance(
  todoListRepo: TodoListRepository,
  data?: Partial<TodoList>,
) {
  return todoListRepo.create(givenTodoList(data));
}

export async function givenTodoListImageInstance(
  todoListImageRepo: TodoListImageRepository,
  data?: Partial<TodoListImage>,
) {
  return todoListImageRepo.create(givenTodoListImage(data));
}

export async function givenEmptyDatabase() {
  const todoRepo: TodoRepository = new TodoRepository(
    testdb,
    async () => todoListRepo,
  );

  const todoListRepo: TodoListRepository = new TodoListRepository(
    testdb,
    async () => todoRepo,
    async () => todoListImageRepo,
  );

  const todoListImageRepo: TodoListImageRepository = new TodoListImageRepository(
    testdb,
    async () => todoListRepo,
  );

  await todoRepo.deleteAll();
  await todoListRepo.deleteAll();
  await todoListImageRepo.deleteAll();
}

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});
