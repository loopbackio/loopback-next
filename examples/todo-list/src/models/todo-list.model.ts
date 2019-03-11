// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  hasMany,
  hasOne,
  model,
  property,
  Value,
} from '@loopback/repository';
import {TodoListImage} from './todo-list-image.model';
import {Todo} from './todo.model';

@model()
export class TodoList extends Entity {
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
  color?: string;

  // FIXME(bajtos) use a class-based decorator
  @hasMany(() => Todo)
  @property(() => Todo)
  todos?: Value<Todo>[];

  // FIXME(bajtos) use a class-based decorator
  @hasOne(() => TodoListImage)
  @property(() => TodoListImage)
  image?: Value<TodoListImage>;

  constructor(data?: Partial<TodoList>) {
    super(data);
  }
}
