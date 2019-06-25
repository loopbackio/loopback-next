// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  Filter,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  juggler,
  Options,
  repository,
} from '@loopback/repository';
import {
  Todo,
  TodoList,
  TodoListImage,
  TodoListRelations,
  TodoListWithRelations,
} from '../models';
import {TodoListImageRepository} from './todo-list-image.repository';
import {TodoRepository} from './todo.repository';

export class TodoListRepository extends DefaultCrudRepository<
  TodoList,
  typeof TodoList.prototype.id,
  TodoListRelations
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;
  public readonly image: HasOneRepositoryFactory<
    TodoListImage,
    typeof TodoList.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('TodoRepository')
    protected todoRepositoryGetter: Getter<TodoRepository>,
    @repository.getter('TodoListImageRepository')
    protected todoListImageRepositoryGetter: Getter<TodoListImageRepository>,
  ) {
    super(TodoList, dataSource);
    this.todos = this.createHasManyRepositoryFactoryFor(
      'todos',
      todoRepositoryGetter,
    );
    this.image = this.createHasOneRepositoryFactoryFor(
      'image',
      todoListImageRepositoryGetter,
    );
  }

  public findByTitle(title: string) {
    return this.findOne({where: {title}});
  }

  async find(
    filter?: Filter<TodoList>,
    options?: Options,
  ): Promise<TodoListWithRelations[]> {
    // Prevent juggler for applying "include" filter
    // Juggler is not aware of LB4 relations
    const include = filter && filter.include;
    filter = {...filter, include: undefined};
    const result = await super.find(filter, options);

    // poor-mans inclusion resolver, this should be handled by DefaultCrudRepo
    // and use `inq` operator to fetch related todos in fewer DB queries
    // this is a temporary implementation, please see
    // https://github.com/strongloop/loopback-next/issues/3195
    if (include && include.length && include[0].relation === 'todos') {
      await Promise.all(
        result.map(async r => {
          // eslint-disable-next-line require-atomic-updates
          r.todos = await this.todos(r.id).find();
        }),
      );
    }

    return result;
  }

  async findById(
    id: typeof TodoList.prototype.id,
    filter?: Filter<TodoList>,
    options?: Options,
  ): Promise<TodoListWithRelations> {
    // Prevent juggler for applying "include" filter
    // Juggler is not aware of LB4 relations
    const include = filter && filter.include;
    filter = {...filter, include: undefined};

    const result = await super.findById(id, filter, options);

    // poor-mans inclusion resolver, this should be handled by DefaultCrudRepo
    // and use `inq` operator to fetch related todos in fewer DB queries
    // this is a temporary implementation, please see
    // https://github.com/strongloop/loopback-next/issues/3195
    if (include && include.length && include[0].relation === 'todos') {
      result.todos = await this.todos(result.id).find();
    }

    return result;
  }
}
