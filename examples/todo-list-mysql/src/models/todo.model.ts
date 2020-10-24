// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-list-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '@loopback/repository';
import {TodoList, TodoListWithRelations} from './todo-list.model';

@model({
  settings: {
    mysql: {
      schema: 'testdb',
      table: 'my_todo',
    },
    foreignKeys: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      fk_todo_todoListId: {
        name: 'fk_todo_todoListId',
        entity: 'TodoList',
        entityKey: 'the_id',
        foreignKey: 'todoListId',
      },
    },
  },
})
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'the_id',
    },
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    mysql: {
      columnName: 'title',
    },
  })
  title: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'desc',
    },
  })
  desc?: string;

  @property({
    type: 'boolean',
    mysql: {
      columnName: 'is_complete',
    },
  })
  isComplete?: boolean;

  @belongsTo(
    () => TodoList,
    {},
    {
      type: 'number',
      mysql: {
        columnName: 'todo_list_id',
      },
    },
  )
  todoListId: number;

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  todoList?: TodoListWithRelations;
}

export type TodoWithRelations = Todo & TodoRelations;
