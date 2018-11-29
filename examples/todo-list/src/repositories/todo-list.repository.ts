// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import {Todo, TodoList, Author} from '../models';
import {TodoRepository} from './todo.repository';
import {AuthorRepository} from './author.repository';

export class TodoListRepository extends DefaultCrudRepository<
  TodoList,
  typeof TodoList.prototype.id
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;
  public readonly author: HasOneRepositoryFactory<
    Author,
    typeof TodoList.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('TodoRepository')
    protected todoRepositoryGetter: Getter<TodoRepository>,
    @repository.getter('AuthorRepository')
    protected todoListImageRepositoryGetter: Getter<AuthorRepository>,
  ) {
    super(TodoList, dataSource);
    this.todos = this._createHasManyRepositoryFactoryFor(
      'todos',
      todoRepositoryGetter,
    );
    this.author = this._createHasOneRepositoryFactoryFor(
      'author',
      todoListImageRepositoryGetter,
    );
  }

  public findByTitle(title: string) {
    return this.findOne({where: {title}});
  }
}
