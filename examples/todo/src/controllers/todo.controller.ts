// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories';
import {Todo} from '../models';
import {
  HttpErrors,
  post,
  param,
  requestBody,
  get,
  put,
  patch,
  del,
} from '@loopback/rest';

export class TodoController {
  constructor(@repository(TodoRepository) protected todoRepo: TodoRepository) {}

  @post('/todos')
  async createTodo(@requestBody() todo: Todo) {
    // TODO(bajtos) This should be handled by the framework
    // See https://github.com/strongloop/loopback-next/issues/118
    if (!todo.title) {
      throw new HttpErrors.BadRequest('title is required');
    }
    return await this.todoRepo.create(todo);
  }

  @get('/todos/{id}')
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    return await this.todoRepo.findById(id);
  }

  @get('/todos')
  async findTodos(): Promise<Todo[]> {
    return await this.todoRepo.find();
  }

  @put('/todos/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    // REST adapter does not coerce parameter values coming from string sources
    // like path & query. As a workaround, we have to cast the value to a number
    // ourselves.
    // See https://github.com/strongloop/loopback-next/issues/750
    id = +id;

    return await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todos/{id}')
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    // REST adapter does not coerce parameter values coming from string sources
    // like path & query. As a workaround, we have to cast the value to a number
    // ourselves.
    // See https://github.com/strongloop/loopback-next/issues/750
    id = +id;

    return await this.todoRepo.updateById(id, todo);
  }

  @del('/todos/{id}')
  async deleteTodo(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }
}
