// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {TodoListImage, TodoList} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {TodoListRepository} from './todo-list.repository';

export class TodoListImageRepository extends DefaultCrudRepository<
  TodoListImage,
  typeof TodoListImage.prototype.id
> {
  public readonly todoList: BelongsToAccessor<
    TodoList,
    typeof TodoListImage.prototype.id
  >;
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('TodoListRepository')
    protected todoListRepositoryGetter: Getter<TodoListRepository>,
  ) {
    super(TodoListImage, dataSource);
    this.todoList = this._createBelongsToAccessorFor(
      'todoList',
      todoListRepositoryGetter,
    );
  }
}
