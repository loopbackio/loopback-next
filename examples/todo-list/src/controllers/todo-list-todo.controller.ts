// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository, Filter, Where} from '@loopback/repository';
import {TodoListRepository} from '../repositories';
import {post, get, patch, del, param, requestBody} from '@loopback/rest';
import {Todo} from '../models';

export class TodoListTodoController {
  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}

  @post('/todo-lists/{id}/todos')
  async create(@param.path.number('id') id: number, @requestBody() todo: Todo) {
    return await this.todoListRepo.todos(id).create(todo);
  }

  @get('/todo-lists/{id}/todos')
  async find(
    @param.path.number('id') id: number,
    @param.query.string('filter') filter?: Filter,
  ) {
    return await this.todoListRepo.todos(id).find(filter);
  }

  @patch('/todo-lists/{id}/todos')
  async patch(
    @param.path.number('id') id: number,
    @requestBody() todo: Partial<Todo>,
    @param.query.string('where') where?: Where,
  ) {
    return await this.todoListRepo.todos(id).patch(todo, where);
  }

  @del('/todo-lists/{id}/todos')
  async delete(
    @param.path.number('id') id: number,
    @param.query.string('where') where?: Where,
  ) {
    return await this.todoListRepo.todos(id).delete(where);
  }
}
