// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository} from '@loopback/repository';
import {del, get, param, patch, post, put, requestBody} from '@loopback/rest';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';

export class TodoController {
  constructor(@repository(TodoRepository) protected todoRepo: TodoRepository) {}

  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {'x-ts-type': Todo}},
      },
    },
  })
  async createTodo(@requestBody() todo: Todo) {
    return await this.todoRepo.create(todo);
  }

  @get('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {'x-ts-type': Todo}},
      },
    },
  })
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    return await this.todoRepo.findById(id);
  }

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Todo}},
          },
        },
      },
    },
  })
  async findTodos(): Promise<Todo[]> {
    return await this.todoRepo.find();
  }

  @put('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo PUT success',
        content: {'application/json': {'x-ts-type': Boolean}},
      },
    },
  })
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo PATCH success',
        content: {'application/json': {'x-ts-type': Boolean}},
      },
    },
  })
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.updateById(id, todo);
  }

  @del('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo DELETE success',
        content: {'application/json': {'x-ts-type': Boolean}},
      },
    },
  })
  async deleteTodo(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }
}
