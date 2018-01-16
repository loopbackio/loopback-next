import {post, param, get, put, patch, del} from '@loopback/openapi-v2';
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
  @param.body('todo', TodoSchema)
  async createTodo(todo: Todo) {
    // TODO(bajtos) This should be handled by the framework
    // See https://github.com/strongloop/loopback-next/issues/118
    if (!todo.title) {
      return Promise.reject(new HttpErrors.BadRequest('title is required'));
    }
    return await this.todoRepo.create(todo);
  }

  @get('/todo/{id}')
  @param.path.number('id')
  @param.query.boolean('items')
  async findTodoById(id: number, items?: boolean): Promise<Todo> {
    return await this.todoRepo.findById(id);
  }

  @get('/todo')
  async findTodos(): Promise<Todo[]> {
    return await this.todoRepo.find();
  }

  @put('/todo/{id}')
  @param.path.number('id')
  @param.body('todo', TodoSchema)
  async replaceTodo(id: number, todo: Todo): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todo/{id}')
  @param.path.number('id')
  @param.body('todo', TodoSchema)
  async updateTodo(id: number, todo: Todo): Promise<boolean> {
    return await this.todoRepo.updateById(id, todo);
  }

  @del('/todo/{id}')
  @param.path.number('id')
  async deleteTodo(id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }
}
