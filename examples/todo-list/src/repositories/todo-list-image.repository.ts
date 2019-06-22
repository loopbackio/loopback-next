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
import {
  TodoList,
  TodoListImage,
  TodoListImageRelations,
  TodoListImageWithRelations,
} from '../models';
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
  }

  async find(
    filter?: Filter<TodoListImage>,
    options?: Options,
  ): Promise<TodoListImageWithRelations[]> {
    // Prevent juggler for applying "include" filter
    // Juggler is not aware of LB4 relations
    const include = filter && filter.include;
    filter = {...filter, include: undefined};

    const result = await super.find(filter, options);

    // poor-mans inclusion resolver, this should be handled by DefaultCrudRepo
    // and use `inq` operator to fetch related todo-lists in fewer DB queries
    // this is a temporary implementation, please see
    // https://github.com/strongloop/loopback-next/issues/3195
    if (include && include.length && include[0].relation === 'todoList') {
      await Promise.all(
        result.map(async r => {
          r.todoList = await this.todoList(r.id);
        }),
      );
    }

    return result;
  }

  async findById(
    id: typeof TodoListImage.prototype.id,
    filter?: Filter<TodoListImage>,
    options?: Options,
  ): Promise<TodoListImageWithRelations> {
    // Prevent juggler for applying "include" filter
    // Juggler is not aware of LB4 relations
    const include = filter && filter.include;
    filter = {...filter, include: undefined};

    const result = await super.findById(id, filter, options);

    // poor-mans inclusion resolver, this should be handled by DefaultCrudRepo
    // and use `inq` operator to fetch related todo-lists in fewer DB queries
    // this is a temporary implementation, please see
    // https://github.com/strongloop/loopback-next/issues/3195
    if (include && include.length && include[0].relation === 'todoList') {
      result.todoList = await this.todoList(result.id);
    }

    return result;
  }
}
