// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  Filter,
  juggler,
  Options,
  repository,
} from '@loopback/repository';
import {Todo, TodoList, TodoRelations} from '../models';
import {TodoListRepository} from './todo-list.repository';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id,
  TodoRelations
> {
  public readonly todoList: BelongsToAccessor<
    TodoList,
    typeof Todo.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('TodoListRepository')
    protected todoListRepositoryGetter: Getter<TodoListRepository>,
  ) {
    super(Todo, dataSource);

    this.todoList = this.createBelongsToAccessorFor(
      'todoList',
      todoListRepositoryGetter,
    );
  }

  protected async includeRelatedModels(
    entities: Todo[],
    filter?: Filter<Todo>,
    _options?: Options,
  ): Promise<(Todo & TodoRelations)[]> {
    const result = entities as (Todo & TodoRelations)[];

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
