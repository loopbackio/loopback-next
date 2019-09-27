// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  juggler,
  repository,
} from '@loopback/repository';
import {Todo, TodoList, TodoListImage, TodoListRelations} from '../models';
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

    this.registerInclusionResolver('todos', this.todos.inclusionResolver);

    this.image = this.createHasOneRepositoryFactoryFor(
      'image',
      todoListImageRepositoryGetter,
    );

    this.registerInclusionResolver('image', this.image.inclusionResolver);
  }

  public findByTitle(title: string) {
    return this.findOne({where: {title}});
  }
}
