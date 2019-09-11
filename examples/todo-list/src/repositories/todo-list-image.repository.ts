// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  InclusionResolver,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TodoList, TodoListImage, TodoListImageRelations} from '../models';
import {TodoListRepository} from './todo-list.repository';

export class TodoListImageRepository extends DefaultCrudRepository<
  TodoListImage,
  typeof TodoListImage.prototype.id,
  TodoListImageRelations
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
    this.todoList = this.createBelongsToAccessorFor(
      'todoList',
      todoListRepositoryGetter,
    );

    // this is a temporary implementation until
    // https://github.com/strongloop/loopback-next/issues/3450 is landed
    const todoListResolver: InclusionResolver<
      TodoListImage,
      TodoList
    > = async images => {
      const todoLists = [];

      for (const image of images) {
        const todoList = await this.todoList(image.id);
        todoLists.push(todoList);
      }

      return todoLists;
    };

    this.registerInclusionResolver('todoList', todoListResolver);
  }
}
