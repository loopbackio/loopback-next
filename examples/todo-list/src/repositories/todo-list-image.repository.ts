// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  Filter,
  Options,
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
    this.registerBelongsToInclusion('todoList', todoListRepositoryGetter);
  }

  protected async includeRelatedModels(
    entities: TodoListImage[],
    filter?: Filter<TodoListImage>,
    _options?: Options,
  ): Promise<(TodoListImage & TodoListImageRelations)[]> {
    const result = entities as (TodoListImage & TodoListImageRelations)[];

    // poor-mans inclusion resolver, this should be handled by DefaultCrudRepo
    // and use `inq` operator to fetch related todo-lists in fewer DB queries
    // this is a temporary implementation, please see
    // https://github.com/strongloop/loopback-next/issues/3195
    const include = filter && filter.include;
    if (include && include.length && include[0].relation === 'todoList') {
      await Promise.all(
        result.map(async r => {
          // eslint-disable-next-line require-atomic-updates
          r.todoList = await this.todoList(r.id);
        }),
      );
    }

    return result;
  }
}
