// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  InclusionResolver,
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

    // this is a temporary implementation until
    // https://github.com/strongloop/loopback-next/issues/3450 is landed
    const todosResolver: InclusionResolver<
      TodoList,
      Todo
    > = async todoLists => {
      const todos: Todo[][] = [];
      for (const todoList of todoLists) {
        const todo = await this.todos(todoList.id).find();
        todos.push(todo);
      }

      return todos;
    };

    this.registerInclusionResolver('todos', todosResolver);

    this.image = this.createHasOneRepositoryFactoryFor(
      'image',
      todoListImageRepositoryGetter,
    );

    // this is a temporary implementation until
    // https://github.com/strongloop/loopback-next/issues/3450 is landed
    const imageResolver: InclusionResolver<
      TodoList,
      TodoListImage
    > = async todoLists => {
      const images = [];

      for (const todoList of todoLists) {
        const image = await this.image(todoList.id).get();
        images.push(image);
      }

      return images;
    };

    this.registerInclusionResolver('image', imageResolver);
  }

  public findByTitle(title: string) {
    return this.findOne({where: {title}});
  }
}
