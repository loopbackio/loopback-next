// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {TodoList, Todo} from '../models';
import {inject, Getter} from '@loopback/core';
import {TodoRepository} from './todo.repository';

export class TodoListRepository extends DefaultCrudRepository<
  TodoList,
  typeof TodoList.prototype.id
> {
  public todos: HasManyRepositoryFactory<Todo, typeof TodoList.prototype.id>;

  constructor(
    @inject('datasources.db') protected datasource: juggler.DataSource,
    @repository.getter('repositories.TodoRepository')
    protected getTodoRepository: Getter<TodoRepository>,
  ) {
    super(TodoList, datasource);
    this.todos = this._createHasManyRepositoryFactoryFor(
      'todos',
      getTodoRepository,
    );
  }
}
