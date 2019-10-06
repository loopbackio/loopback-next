// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, repository} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {Todo, TodoList} from '../models';
import {TodoRepository} from '../repositories';

export class TodoController {
  constructor(@repository(TodoRepository) protected todoRepo: TodoRepository) {}

  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async createTodo(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {title: 'NewTodo', exclude: ['id']}),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.todoRepo.create(todo);
  }

  @get('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Todo, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Todo))
    filter?: Filter<Todo>,
  ): Promise<Todo> {
    return this.todoRepo.findById(id, filter);
  }

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Todo, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findTodos(
    @param.query.object('filter', getFilterSchemaFor(Todo))
    filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todoRepo.find(filter);
  }

  @put('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PUT success',
      },
    },
  })
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<void> {
    await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PATCH success',
      },
    },
  })
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>,
  ): Promise<void> {
    await this.todoRepo.updateById(id, todo);
  }

  @del('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo DELETE success',
      },
    },
  })
  async deleteTodo(@param.path.number('id') id: number): Promise<void> {
    await this.todoRepo.deleteById(id);
  }

  @get('/todos/{id}/todo-list', {
    responses: {
      '200': {
        description: 'TodoList model instance',
        content: {'application/json': {schema: getModelSchemaRef(TodoList)}},
      },
    },
  })
  async findOwningList(@param.path.number('id') id: number): Promise<TodoList> {
    return this.todoRepo.todoList(id);
  }
}
