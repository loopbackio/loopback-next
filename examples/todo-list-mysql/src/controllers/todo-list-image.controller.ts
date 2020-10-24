// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-todo-list-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {TodoList, TodoListImage} from '../models';
import {TodoListImageRepository} from '../repositories';

export class TodoListImageController {
  constructor(
    @repository(TodoListImageRepository)
    public todoListImageRepository: TodoListImageRepository,
  ) {}

  @post('/todo-list-images', {
    responses: {
      '200': {
        description: 'TodoListImage model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(TodoListImage)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoListImage, {
            title: 'NewTodoListImage',
            exclude: ['id'],
          }),
        },
      },
    })
    todoListImage: Omit<TodoListImage, 'id'>,
  ): Promise<TodoListImage> {
    return this.todoListImageRepository.create(todoListImage);
  }

  @get('/todo-list-images/count', {
    responses: {
      '200': {
        description: 'TodoListImage model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(TodoListImage) where?: Where<TodoListImage>,
  ): Promise<Count> {
    return this.todoListImageRepository.count(where);
  }

  @get('/todo-list-images', {
    responses: {
      '200': {
        description: 'Array of TodoListImage model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(TodoListImage, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(TodoListImage) filter?: Filter<TodoListImage>,
  ): Promise<TodoListImage[]> {
    return this.todoListImageRepository.find(filter);
  }

  @patch('/todo-list-images', {
    responses: {
      '200': {
        description: 'TodoListImage PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoListImage, {partial: true}),
        },
      },
    })
    todoListImage: TodoListImage,
    @param.where(TodoListImage) where?: Where<TodoListImage>,
  ): Promise<Count> {
    return this.todoListImageRepository.updateAll(todoListImage, where);
  }

  @get('/todo-list-images/{id}', {
    responses: {
      '200': {
        description: 'TodoListImage model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TodoListImage, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(TodoListImage, {exclude: 'where'})
    filter?: FilterExcludingWhere<TodoListImage>,
  ): Promise<TodoListImage> {
    return this.todoListImageRepository.findById(id, filter);
  }

  @patch('/todo-list-images/{id}', {
    responses: {
      '204': {
        description: 'TodoListImage PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoListImage, {partial: true}),
        },
      },
    })
    todoListImage: TodoListImage,
  ): Promise<void> {
    await this.todoListImageRepository.updateById(id, todoListImage);
  }

  @put('/todo-list-images/{id}', {
    responses: {
      '204': {
        description: 'TodoListImage PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() todoListImage: TodoListImage,
  ): Promise<void> {
    await this.todoListImageRepository.replaceById(id, todoListImage);
  }

  @del('/todo-list-images/{id}', {
    responses: {
      '204': {
        description: 'TodoListImage DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoListImageRepository.deleteById(id);
  }

  @get('/todo-list-images/{id}/todo-list', {
    responses: {
      '200': {
        description: 'TodoList belonging to TodoListImage',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TodoList)},
          },
        },
      },
    },
  })
  async getTodoList(
    @param.path.number('id') id: typeof TodoListImage.prototype.id,
  ): Promise<TodoList> {
    return this.todoListImageRepository.todoList(id);
  }
}
