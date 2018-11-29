import {TodoListRepository} from '../repositories';
import {repository, Filter} from '@loopback/repository';
import {param, post, requestBody, get} from '@loopback/rest';
import {Author} from '../models';

export class TodoListAuthorController {
  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}

  @post('/todo-lists/{id}/author', {
    responses: {
      '200': {
        description: 'create Author model instance',
        content: {'application/json': {schema: {'x-ts-type': Author}}},
      },
    },
  })
  async create(
    @param.path.number('id') id: number,
    @requestBody() author: Author,
  ): Promise<Author> {
    return await this.todoListRepo.author(id).create(author);
  }

  @get('/todo-lists/{id}/author', {
    responses: {
      '200': {
        description: 'The author belonging to the TodoList',
        content: {'application/json': {schema: {'x-ts-type': Author}}},
      },
    },
  })
  async find(@param.path.number('id') id: number): Promise<Author | undefined> {
    return await this.todoListRepo.author(id).get();
  }
}
