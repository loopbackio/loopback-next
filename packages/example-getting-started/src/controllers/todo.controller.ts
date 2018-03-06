import {
  post,
  param,
  get,
  put,
  patch,
  del,
  requestBody,
  operation,
} from '@loopback/openapi-v3';
import {HttpErrors, RestBindings} from '@loopback/rest';
import {Todo} from '../models';
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories';
import {inject} from '@loopback/core';
import {ServerResponse} from 'http';

export class TodoController {
  // TODO(bajtos) Fix documentation (and argument names?) of @repository()
  // to allow the usage below.
  // See https://github.com/strongloop/loopback-next/issues/744
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
    @inject(RestBindings.Http.RESPONSE) public res: ServerResponse,
  ) {}

  @post('/todo')
  async createTodo(@requestBody() todo: Todo) {
    // TODO(bajtos) This should be handled by the framework
    // See https://github.com/strongloop/loopback-next/issues/118
    if (!todo.title) {
      return Promise.reject(new HttpErrors.BadRequest('title is required'));
    }
    return await this.todoRepo.create(todo);
  }

  @get('/todo/{id}')
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    return await this.todoRepo.findById(id);
  }

  @get('/todo')
  async findTodos(): Promise<Todo[]> {
    return await this.todoRepo.find();
  }

  @put('/todo/{id}')
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

  @patch('/todo/{id}')
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

  @del('/todo/{id}')
  async deleteTodo(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }

  /**
   * Swagger UI is not a local component, hence we need to enable CORS support
   * for complex requests by returning a OPTIONS header with the appropriate
   * headers. When a CORS request is made for a complex request, a pre-flight
   * request is performed (also known as a OPTIONS request) to ensure access is
   * allowed. The following two methods set the required headers for CORS pre-flight check.
   */
  @operation('options', '/todo')
  async allowCors() {
    this.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    this.res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Access-Control-Allow-Headers',
    );
  }

  @operation('options', '/todo/{id}')
  async allowCorsOnID() {
    this.res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, PUT, PATCH, DELETE, OPTIONS',
    );
    this.res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Access-Control-Allow-Headers',
    );
  }
}
