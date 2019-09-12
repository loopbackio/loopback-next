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
Controller TodoList will be created in src/controllers/todo-list.controller.ts

? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? TodoList
? What is the name of your CRUD repository? TodoListRepository
? What is the name of ID property? id
? What is the type of your ID? number
? What is the base HTTP path name of the CRUD operations? /todo-lists
   create src/controllers/todo-list.controller.ts
   update src/controllers/index.ts

Controller TodoList was created in src/controllers/
```

And voilà! We now have a set of basic APIs for todo-lists, just like that!

#### Inclusion of Related Models

In order to get our related `Todo`s for each `TodoList`, let's update the
`schema`.

In `src/models/todo-list.controller.ts`, first import `getModelSchemaRef` from
`@loopback/rest`.

Then update the following `schema`s in `responses`'s `content`:

{% include code-caption.html content="src/models/todo-list.controller.ts" %}

```ts
@get('/todo-lists', {
  responses: {
    '200': {
      description: 'Array of TodoList model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(TodoList, {includeRelations: true}),
          },
        },
      },
    },
  },
})
async find(/*...*/) {/*...*/}

@get('/todo-lists/{id}', {
  responses: {
    '200': {
      description: 'TodoList model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(TodoList, {includeRelations: true}),
        },
      },
    },
  },
})
async findById(/*...*/) {/*...*/}
```

Let's also update it in the `TodoController`:

{% include code-caption.html content="src/models/todo.controller.ts" %}

```ts
@get('/todos', {
  responses: {
    '200': {
      description: 'Array of Todo model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Todo, {includeRelations: true}),
          },
        },
      },
    },
  },
})
})
async findTodos(/*...*/) {/*...*/}

@get('/todos/{id}', {
  responses: {
    '200': {
      description: 'Todo model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {includeRelations: true}),
        },
      },
    },
  },
})
async findTodoById(/*...*/) {/*...*/}
```

### Create TodoList's Todo controller

For the controller handling `Todos` of a `TodoList`, we'll start with an empty
controller:

```sh
$ lb4 controller
? Controller class name: TodoListTodo
Controller TodoListTodo will be created in src/controllers/todo-list-todo.controller.ts

? What kind of controller would you like to generate? Empty Controller
   create src/controllers/todo-list-todo.controller.ts
   update src/controllers/index.ts

Controller TodoListTodo was created in src/controllers/
```

Let's add in an injection for our `TodoListRepository`:

{% include code-caption.html content="src/controllers/todo-list-todo.controller.ts" %}

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

{% include code-caption.html content="src/controllers/todo-list-todo.controller.ts" %}

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
  async create(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {title: 'NewTodo', exclude: ['id']}),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ) {
    return this.todoListRepo.todos(id).create(todo);
  }
}
```

Using our constraining factory as we did with the `POST` request, we'll define
the controller methods for the rest of the HTTP verbs for the route. The
completed controller should look as follows:

{% include code-caption.html content="src/controllers/todo-list-todo.controller.ts" %}

```ts
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
import {Todo} from '../models';
import {TodoListRepository} from '../repositories';

export class TodoListTodoController {
  constructor(
    @repository(TodoListRepository) protected todoListRepo: TodoListRepository,
  ) {}

  @post('/todo-lists/{id}/todos', {
    responses: {
      '200': {
        description: 'TodoList.Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {title: 'NewTodo', exclude: ['id']}),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.todoListRepo.todos(id).create(todo);
  }

  @get('/todo-lists/{id}/todos', {
    responses: {
      '200': {
        description: "Array of Todo's belonging to TodoList",
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todoListRepo.todos(id).find(filter);
  }

  @patch('/todo-lists/{id}/todos', {
    responses: {
      '200': {
        description: 'TodoList.Todo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoListRepo.todos(id).patch(todo, where);
  }

  @del('/todo-lists/{id}/todos', {
    responses: {
      '200': {
        description: 'TodoList.Todo DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoListRepo.todos(id).delete(where);
  }
}
```

Check out our `TodoList` example to see the full source code generated for the
`TodoListTodo` controller:
[src/controllers/todo-list-todo.controller.ts](https://github.com/strongloop/loopback-next/blob/master/examples/todo-list/src/controllers/todo-list-todo.controller.ts)

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
- `GET /todo-lists/{id}/todos` and see if you get the todo you created from
  before.

And there you have it! You now have the power to define APIs for related models!

### Navigation

Previous step: [Add TodoList repository](todo-list-tutorial-repository.md)
