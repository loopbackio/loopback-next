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
      table: 'my_todo_list_image',
    },
    foreignKeys: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      fk_todoListImage_todoListId: {
        name: 'fk_todoListImage_todoListId',
        entity: 'TodoList',
        entityKey: 'the_id',
        foreignKey: 'todoListId',
      },
    },
  },
})
export class TodoListImage extends Entity {
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
      columnName: 'value',
    },
  })
  // Ideally we would use Buffer type here, but
  // that is not supported yet.
  // see https://github.com/strongloop/loopback-next/issues/1742
  value: string;

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

  constructor(data?: Partial<TodoListImage>) {
    super(data);
  }
}

export interface TodoListImageRelations {
  // describe navigational properties here
  todoList?: TodoListWithRelations;
}

export type TodoListImageWithRelations = TodoListImage & TodoListImageRelations;
