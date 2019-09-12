// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
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
import {Todo} from '../models';
import {TodoRepository} from '../repositories';
import {GeocoderService} from '../services';

export class TodoController {
  constructor(
    @repository(TodoRepository) protected todoRepo: TodoRepository,
    @inject('services.GeocoderService') protected geoService: GeocoderService,
  ) {}

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
    if (todo.remindAtAddress) {
      // TODO(bajtos) handle "address not found"
      const geo = await this.geoService.geocode(todo.remindAtAddress);
      // Encode the coordinates as "lat,lng" (Google Maps API format). See also
      // https://stackoverflow.com/q/7309121/69868
      // https://gis.stackexchange.com/q/7379
      // eslint-disable-next-line require-atomic-updates
      todo.remindAtGeo = `${geo[0].y},${geo[0].x}`;
    }
    return this.todoRepo.create(todo);
  }

  @get('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    return this.todoRepo.findById(id);
  }

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
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
}
