import {
  post,
  param,
  get,
  put,
  patch,
  del,
  requestBody,
} from '@loopback/openapi-v3';
import {HttpErrors} from '@loopback/rest';
import {TodoSchema, Todo} from '../models';
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories/index';

export class TodoController {
  // TODO(bajtos) Fix documentation (and argument names?) of @repository()
  // to allow the usage below.
  // See https://github.com/strongloop/loopback-next/issues/744
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
  ) {}
  @post('/todo')
  async createTodo(
    // TODO(janny) The requestBody Spec will be empty after we
    // 1. update to generate schema from bottom-up
    // 2. decide the default content type
    @requestBody({content: {'application/json': {schema: TodoSchema}}})
    todo: Todo,
  ) {
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
    @requestBody({content: {'application/json': {schema: TodoSchema}}})
    todo: Todo,
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
    @requestBody({content: {'application/json': {schema: TodoSchema}}})
    todo: Todo,
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
}
