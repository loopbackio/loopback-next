### Create your controller

Now, we'll create a controller to handle our Todo routes. Create the
`src/controllers` directory and two files inside:
- `index.ts` (export helper)
- `todo.controller.ts`

In addition to creating the CRUD methods themselves, we'll also be adding
decorators that setup the routing as well as the expected parameters of
incoming requests.

#### src/controllers/todo.controller.ts
```ts
import {post, param, get, put, patch, del} from '@loopback/openapi-v2';
import {HttpErrors} from '@loopback/rest';
import {TodoSchema, Todo} from '../models';
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories/index';

export class TodoController {
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
  ) {}
  @post('/todo')
  @param.body('todo', TodoSchema)
  async createTodo(todo: Todo) {
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
```

### Navigation

Previous step: [Add a repository](6-repository)

Final step: [Putting it all together](8-putting-it-together)
