// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  InclusionResolver,
  juggler,
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

    // this is a temporary implementation until
    // https://github.com/strongloop/loopback-next/issues/3450 is landed
    const todoListResolver: InclusionResolver<Todo, TodoList> = async todos => {
      const todoLists = [];

      for (const todo of todos) {
        const todoList = await this.todoList(todo.id);
        todoLists.push(todoList);
      }

      return todoLists;
    };

    this.registerInclusionResolver('todoList', todoListResolver);
  }
}
