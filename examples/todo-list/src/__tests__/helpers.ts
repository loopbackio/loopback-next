// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Todo, TodoList, TodoListImage} from '../models';

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
 * @param todo A partial (or complete) Todo object.
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

/**
 * Generate a complete TodoList object for use with tests
 * @param todoList A partial (or complete) TodoList object.
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
 * @param todoListImage A partial (or complete) TodoListImage object.
 */
export function givenTodoListImage(todoListImage?: Partial<TodoListImage>) {
  const data = Object.assign(
    {
      value: 'A picture of a basket of fruits',
    },
    todoListImage,
  );
  return new TodoListImage(data);
}
