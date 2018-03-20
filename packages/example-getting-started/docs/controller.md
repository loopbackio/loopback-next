### Controllers

In LoopBack 4, controllers handle the request-response lifecycle for your API.
Each function on a controller can be addressed individually to handle an
incoming request (like a POST request to `/todo`), perform business logic and
then return a response.

In this respect, controllers are the regions _in which most of your business
logic will live_!

### Create your controller

So, let's create a controller to handle our Todo routes. Create the
`src/controllers` directory and two files inside:

* `index.ts` (export helper)
* `todo.controller.ts`

In addition to creating the handler functions themselves, we'll also be adding
decorators that setup the routing as well as the expected parameters of incoming
requests.

First, we need to define our basic controller class as well as plug in our
repository, which we'll use to perform our operations against the datasource.

#### src/controllers/todo.controller.ts

```ts
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories/index';

export class TodoController {
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
  ) {}
}
```

The `@repository` decorator will retrieve and inject an instance of the
`TodoRepository` whenever an inbound request is being handled. The lifecycle of
controller objects is per-request, which means that a new controller instance is
created for each request. As a result, we want to inject our `TodoRepository`
since the creation of these instances is more complex and expensive than making
new controller instances.

> **NOTE**: You can customize the lifecycle of _all_ bindings in LoopBack 4!
> Controllers can easily be made to use singleton lifecycles to minimize startup
> costs. For more information, see the
> [Dependency injection](http://loopback.io/doc/en/lb4/Dependency-injection.html)
> section of our docs.

Now that we have the repository wireup, let's create our first handler function.

#### src/controllers/todo.controller.ts

```ts
import {post, param} from '@loopback/openapi-v3';
import {HttpErrors} from '@loopback/rest';
import {Todo} from '../models';
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories/index';

export class TodoController {
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
  ) {}

  @post('/todo')
  async createTodo(@requestBody() todo: Todo) {
    if (!todo.title) {
      return Promise.reject(new HttpErrors.BadRequest('title is required'));
    }
    return await this.todoRepo.create(todo);
  }
}
```

In this example, we're using two new decorators to provide LoopBack with
metadata about the route, verb and the format of the incoming request body:

* `@post('/todo')` creates metadata for LoopBack's [RestServer]() so that it can
  redirect requests to this function when the path and verb match.
* `@requestBody()` associates the OpenAPI schema for a Todo with the body of the
  request so that LoopBack can validate the format of an incoming request
  (**Note**: As of this writing, schematic validation is not yet functional).

We've also added our own validation logic to ensure that a user will receive an
error if they fail to provide a `title` property with their `POST` request.

Lastly, we are using the functions provided by our `TodoRepository` instance to
perform a create operation against the datasource.

You can use these and other decorators to create a REST API for a full set of
verbs:

#### src/controllers/todo.controller.ts

```ts
import {
  post,
  param,
  requestBody,
  get,
  put,
  patch,
  del,
} from '@loopback/openapi-v3';
import {HttpErrors} from '@loopback/rest';
import {Todo} from '../models';
import {repository} from '@loopback/repository';
import {TodoRepository} from '../repositories/index';

export class TodoController {
  constructor(
    @repository(TodoRepository.name) protected todoRepo: TodoRepository,
  ) {}

  @post('/todo')
  async createTodo(@requestBody() todo: Todo) {
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
    return await this.todoRepo.replaceById(id, todo);
  }

  @patch('/todo/{id}')
  async updateTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.updateById(id, todo);
  }

  @del('/todo/{id}')
  async deleteTodo(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoRepo.deleteById(id);
  }
}
```

Some additional things to note about this example:

* Routes like `@get('/todo/{id}')` can be paired with the `@param.path`
  decorators to inject those values at request time into the handler function.
* LoopBack's `@param` decorator also contains a namespace full of other
  "subdecorators" like `@param.path`, `@param.query`, and `@param.body` that
  allow specification of metadata for those parts of a REST request.
* LoopBack's `@param.path` and `@param.query` also provide subdecorators for
  specifying the type of certain value primitives, such as
  `@param.path.number('id')`.

Now that we've wired up the controller, our last step is to tie it all into the
[Application](putting-it-together.md)!

### Navigation

Previous step: [Add a repository](repository.md)

Final step: [Putting it all together](putting-it-together.md)
