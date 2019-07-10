// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '@loopback/repository';
import {TodoList, TodoListWithRelations} from './todo-list.model';

@model()
export class TodoListImage extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @belongsTo(() => TodoList)
  todoListId: number;

  @property({
    required: true,
  })
  // Ideally we would use Buffer type here, but
  // that is not supported yet.
  // see https://github.com/strongloop/loopback-next/issues/1742
  value: string;

  constructor(data?: Partial<TodoListImage>) {
    super(data);
  }
}

export interface TodoListImageRelations {
  todoList?: TodoListWithRelations;
}

export type TodoListImageWithRelations = TodoListImage & TodoListImageRelations;
