// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {TodoList, TodoListImage} from '../models';
import {TodoListRepository} from '../repositories';

export class TodoListTodoListImageController {
  constructor(
    @repository(TodoListRepository)
    protected todoListRepository: TodoListRepository,
  ) {}

  @get('/todo-lists/{id}/todo-list-image', {
    responses: {
      '200': {
        description: 'TodoList has one TodoListImage',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TodoListImage),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<TodoListImage>,
  ): Promise<TodoListImage> {
    return this.todoListRepository.image(id).get(filter);
  }

  @post('/todo-lists/{id}/todo-list-image', {
    responses: {
      '200': {
        description: 'TodoList model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(TodoListImage)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof TodoList.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoListImage, {
            title: 'NewTodoListImageInTodoList',
            exclude: ['id'],
            optional: ['todoListId'],
          }),
        },
      },
    })
    todoListImage: Omit<TodoListImage, 'id'>,
  ): Promise<TodoListImage> {
    return this.todoListRepository.image(id).create(todoListImage);
  }

  @patch('/todo-lists/{id}/todo-list-image', {
    responses: {
      '200': {
        description: 'TodoList.TodoListImage PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoListImage, {partial: true}),
        },
      },
    })
    todoListImage: Partial<TodoListImage>,
    @param.query.object('where', getWhereSchemaFor(TodoListImage))
    where?: Where<TodoListImage>,
  ): Promise<Count> {
    return this.todoListRepository.image(id).patch(todoListImage, where);
  }

  @del('/todo-lists/{id}/todo-list-image', {
    responses: {
      '200': {
        description: 'TodoList.TodoListImage DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(TodoListImage))
    where?: Where<TodoListImage>,
  ): Promise<Count> {
    return this.todoListRepository.image(id).delete(where);
  }
}
