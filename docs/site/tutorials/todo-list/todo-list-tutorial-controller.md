---
lang: en
title: "Add TodoList and TodoList's Todo Controller"
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Tutorial
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-controller.html
summary:
  LoopBack 4 TodoList Application Tutorial - Add TodoList and TodoList's Todo
  Controller
---

### Controllers with related models

Defining business logic to handle requests to related models isn't too different
from handling requests for standalone models. We'll create
[controllers](../../Controller.md) to handle requests for todo-lists and todo
items under a todo-list.

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
? Is the id omitted when creating a new instance? Yes
? What is the base HTTP path name of the CRUD operations? /todo-lists
   create src/controllers/todo-list.controller.ts
   update src/controllers/index.ts

Controller TodoList was created in src/controllers/
```

To view the completed file, see the
[`TodoList` example](https://github.com/strongloop/loopback-next/blob/master/examples/todo-list/src/controllers/todo-list.controller.ts).

And voilà! We now have a set of basic APIs for todo-lists, just like that!

#### Inclusion of Related Models

In order to get our related `Todo`s for each `TodoList`, let's update the
`schema`.

In `src/controllers/todo-list.controller.ts`, first import `getModelSchemaRef`
from `@loopback/rest`.

Then update the following `schema`s in `responses`'s `content`:

{% include code-caption.html content="src/controllers/todo-list.controller.ts" %}

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

{% include code-caption.html content="src/controllers/todo.controller.ts" %}

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

#### Relation Controllers

Earlier when we used `lb4 relation` to create the two relations between `Todo`
and `TodoList`, you may have noticed
`src/controllers/todo-todo-list.controller.ts` and
`src/controllers/todo-list-todo.controller.ts` were created. These files contain
a set of API for the relations.

Relation controllers act in a similar manner to normal controllers, except they
modify the relational property. For example, in the
`src/controllers/todo-list-todo.controller.ts` file, we can do requests to the
endpoint `/todo-lists/{id}/todos`, which we'll see in the
[Try it out](#try-it-out) section.

As `src/controllers/todo-todo-list.controller.ts` only contains one method, we
can move it to the `Todo` controller and delete that file:

{% include code-caption.html content="src/controllers/todo.controller.ts" %}

```ts
export class TodoController {
  constructor() {} // ...

  // other controller methods

  @get('/todos/{id}/todo-list', {
    responses: {
      '200': {
        description: 'TodoList belonging to Todo',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TodoList)},
          },
        },
      },
    },
  })
  async getTodoList(
    @param.path.number('id') id: typeof Todo.prototype.id,
  ): Promise<TodoList> {
    return this.todoRepository.todoList(id);
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

{% include note.html content="
When using the API Explorer, be sure to clear out any default <i><b>filter</b></i> or <i><b>where</b></i> objects in order to see all the data." %}

Here are some new requests you can try out:

- `POST /todo-lists` with a body of `{ "title": "grocery list" }`.
- `POST /todo-lists/{id}/todos` using the ID you got back from the previous
  `POST` request and this body: `{ "title": "get eggs", "isComplete": false}`.
  Notice that response body you get back contains property `todoListId` with the
  ID from before.
- `GET /todo-lists/{id}/todos` with the ID from before, and see if you get the
  todo you created from before.
- `GET /todo-lists/{id}` with the ID from before, with the following filter
  `{include: [{relation: 'todos'}]}`, and see if you get a `todos` property with
  the todo created before. **Note**: this filter won't work through the API
  explorer (See this
  [GitHub issue](https://github.com/strongloop/loopback-next/issues/2208) for
  details). Use the following url to test this endpoint (remember to replace
  `{id}` with the ID from before):
  http://localhost:3000/todo-lists/{id}?filter[include][][relation]=todos

And there you have it! You now have the power to define APIs for related models!

### Navigation

Previous step: [Add Model Relations](todo-list-tutorial-relations.md)
