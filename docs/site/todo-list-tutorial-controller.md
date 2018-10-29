---
lang: en
title: "Add TodoList and TodoList's Todo Controller"
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-controller.html
summary:
  LoopBack 4 TodoList Application Tutorial - Add TodoList and TodoList's Todo
  Controller
---

### Controllers with related models

Defining business logic to handle requests to related models isn't too different
from handling requests for standalone models. We'll create controllers to handle
requests for todo-lists and todo items under a todo-list.

### Create TodoList controller

Run the CLI command for creating a RESTful CRUD controller for our `TodoList`
routes with the following inputs:

```sh
$ lb4 controller
? Controller class name: TodoList
? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? TodoList
? What is the name of your CRUD repository? TodoListRepository
? What is the type of your ID? number
? What is the base HTTP path name of the CRUD operations? /todo-lists
   create src/controllers/todo-list.controller.ts
   update src/controllers/index.ts

Controller TodoList was created in src/controllers/
```

And voilà! We now have a set of basic APIs for todo-lists, just like that!

### Create TodoList's Todo controller

For the controller handling `Todos` of a `TodoList`, we'll start with an empty
controller:

```sh
$ lb4 controller
? Controller class name: TodoListTodo
? What kind of controller would you like to generate? Empty Controller
   create src/controllers/todo-list-todo.controller.ts
   update src/controllers/index.ts

Controller TodoListTodo was created in src/controllers/
```

Let's add in an injection for our `TodoListRepository`:

#### src/controllers/todo-list-todo.controller.ts

```ts
import {repository} from '@loopback/repository';
import {TodoListRepository} from '../repositories';

export class TodoListTodoController {
  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}
}
```

We're now ready to add in some routes for our todo requests. To call the CRUD
methods on a todo-list's todo items, we'll first need to create a constrained
`TodoRepository`. We can achieve this by using our repository instance's `todos`
factory function that we defined earlier in `TodoListRepository`.

The `POST` request from `/todo-lists/{id}/todos` should look similar to the
following request:

#### src/controllers/todo-list-todo.controller.ts

```ts
import {repository} from '@loopback/repository';
import {TodoListRepository} from '../repositories';
import {post, param, requestBody} from '@loopback/rest';
import {Todo} from '../models';

export class TodoListTodoController {
  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}

  @post('/todo-lists/{id}/todos')
  async create(@param.path.number('id') id: number, @requestBody() todo: Todo) {
    return await this.todoListRepo.todos(id).create(todo);
  }
}
```

Using our constraining factory as we did with the `POST` request, we'll define
the controller methods for the rest of the HTTP verbs for the route. The
completed controller should look as follows:

#### src/controllers/todo-list.controller.ts

```ts
import {
  Filter,
  repository,
  Where,
  Count,
  CountSchema,
} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {TodoList} from '../models';
import {TodoListRepository} from '../repositories';

export class TodoListController {
  constructor(
    @repository(TodoListRepository)
    public todoListRepository: TodoListRepository,
  ) {}

  @post('/todo-lists', {
    responses: {
      '200': {
        description: 'TodoList model instance',
        content: {'application/json': {schema: {'x-ts-type': TodoList}}},
      },
    },
  })
  async create(@requestBody() obj: TodoList): Promise<TodoList> {
    return await this.todoListRepository.create(obj);
  }

  @get('/todo-lists/count', {
    responses: {
      '200': {
        description: 'TodoList model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(TodoList)) where?: Where,
  ): Promise<Count> {
    return await this.todoListRepository.count(where);
  }

  @get('/todo-lists', {
    responses: {
      '200': {
        description: 'Array of TodoList model instances',
        content: {'application/json': {schema: {'x-ts-type': TodoList}}},
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(TodoList)) filter?: Filter,
  ): Promise<TodoList[]> {
    return await this.todoListRepository.find(filter);
  }

  @patch('/todo-lists', {
    responses: {
      '200': {
        description: 'TodoList PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() obj: Partial<TodoList>,
    @param.query.object('where', getWhereSchemaFor(TodoList)) where?: Where,
  ): Promise<Count> {
    return await this.todoListRepository.updateAll(obj, where);
  }

  @get('/todo-lists/{id}', {
    responses: {
      '200': {
        description: 'TodoList model instance',
        content: {'application/json': {schema: {'x-ts-type': TodoList}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<TodoList> {
    return await this.todoListRepository.findById(id);
  }

  @patch('/todo-lists/{id}', {
    responses: {
      '204': {
        description: 'TodoList PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() obj: TodoList,
  ): Promise<void> {
    await this.todoListRepository.updateById(id, obj);
  }

  @del('/todo-lists/{id}', {
    responses: {
      '204': {
        description: 'TodoList DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoListRepository.deleteById(id);
  }
}
```

### Try it out

With the controllers complete, your application is ready to start up again!
`@loopback/boot` should wire up everything for us when we start the application,
so there's nothing else we need to do before we try out our new routes.

```sh
$ npm start
Server is running at http://127.0.0.1:3000
```

Here are some new requests you can try out:

- `POST /todo-lists` with a body of `{ "title": "grocery list" }`.
- `POST /todo-lists/{id}/todos` using the ID you got back from the previous
  `POST` request and a body for a todo. Notice that response body you get back
  contains property `todoListId` with the ID from before.
- `GET /todos/{id}/todos` and see if you get the todo you created from before.

And there you have it! You now have the power to define APIs for related models!

### Navigation

Previous step: [Add TodoList repository](todo-list-tutorial-repository.md)
