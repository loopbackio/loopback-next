import {TodoListRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {param, post, requestBody, get} from '@loopback/rest';
import {TodoListImage} from '../models';

export class TodoListImageController {
  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}

  @post('/todo-lists/{id}/image', {
    responses: {
      '200': {
        description: 'create todoListImage model instance',
        content: {'application/json': {schema: {'x-ts-type': TodoListImage}}},
      },
    },
  })
  async create(
    @param.path.number('id') id: number,
    @requestBody() image: TodoListImage,
  ): Promise<TodoListImage> {
    return await this.todoListRepo.image(id).create(image);
  }

  @get('/todo-lists/{id}/image', {
    responses: {
      '200': {
        description: 'The image belonging to the TodoList',
        content: {'application/json': {schema: {'x-ts-type': TodoListImage}}},
      },
    },
  })
  async find(@param.path.number('id') id: number): Promise<TodoListImage> {
    return await this.todoListRepo.image(id).get();
  }
}
