// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, property, model, belongsTo} from '@loopback/repository';
import {TodoList} from './todo-list.model';

@model()
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'boolean',
  })
  isComplete: boolean;

  @belongsTo(() => TodoList)
  todoListId: number;

  getId() {
    return this.id;
  }

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}
