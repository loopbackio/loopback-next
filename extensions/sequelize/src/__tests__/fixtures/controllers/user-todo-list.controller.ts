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
import {User, TodoList} from '../models';
import {UserRepository} from '../repositories';

export class UserTodoListController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @get('/users/{id}/todo-list', {
    responses: {
      '200': {
        description: 'User has one TodoList',
        content: {
          'application/json': {
            schema: getModelSchemaRef(TodoList),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<TodoList>,
  ): Promise<TodoList> {
    return this.userRepository.todoList(id).get(filter);
  }

  @post('/users/{id}/todo-list', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(TodoList)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {
            title: 'NewTodoListInUser',
            exclude: ['id'],
            optional: ['user'],
          }),
        },
      },
    })
    todoList: Omit<TodoList, 'id'>,
  ): Promise<TodoList> {
    return this.userRepository.todoList(id).create(todoList);
  }

  @patch('/users/{id}/todo-list', {
    responses: {
      '200': {
        description: 'User.TodoList PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {partial: true}),
        },
      },
    })
    todoList: Partial<TodoList>,
    @param.query.object('where', getWhereSchemaFor(TodoList))
    where?: Where<TodoList>,
  ): Promise<Count> {
    return this.userRepository.todoList(id).patch(todoList, where);
  }

  @del('/users/{id}/todo-list', {
    responses: {
      '200': {
        description: 'User.TodoList DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(TodoList))
    where?: Where<TodoList>,
  ): Promise<Count> {
    return this.userRepository.todoList(id).delete(where);
  }
}
