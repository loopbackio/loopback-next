---
lang: en
title: 'Add a Controller'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-controller.html
summary: LoopBack 4 Todo Application Tutorial - Add a Controller
---

### Controllers

In LoopBack 4, controllers handle the request-response lifecycle for your API.
Each function on a controller can be addressed individually to handle an
incoming request (like a POST request to `/todos`), to perform business logic,
and to return a response.

`Controller` is a class that implements operations defined by application's API.
It implements an application's business logic and acts as a bridge between the
HTTP/REST API and domain/database models.

In this respect, controllers are the regions _in which most of your business
logic will live_!

For more information about Controllers, see
[Controllers](https://loopback.io/doc/en/lb4/Controllers.html).

### Create your controller

You can create a REST controller using the CLI as follows:

```sh
lb4 controller
? Controller class name: todo
Controller Todo will be created in src/controllers/todo.controller.ts

? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? Todo
? What is the name of your CRUD repository? TodoRepository
? What is the name of ID property? id
? What is the type of your ID? number
? Is the id omitted when creating a new instance? Yes
? What is the base HTTP path name of the CRUD operations? /todos
   create src/controllers/todo.controller.ts
   update src/controllers/index.ts

Controller Todo was created in src/controllers/
```

Let's review the `TodoController` located in
`src/controllers/todo.controller.ts`. The `@repository` decorator will retrieve
and inject an instance of the `TodoRepository` whenever an inbound request is
being handled. The lifecycle of controller objects is per-request, which means
that a new controller instance is created for each request. As a result, we want
to inject our `TodoRepository` since the creation of these instances is more
complex and expensive than making new controller instances.

{% include note.html content="You can customize the lifecycle of _all_ bindings in LoopBack 4! Controllers can easily be made to use singleton lifecycles to minimize startup costs. For more information, see the [Dependency injection](../../Dependency-injection.md) section of our docs.
" %}

In this example, there are two new decorators to provide LoopBack with metadata
about the route, verb and the format of the incoming request body:

- `@post('/todos')` creates metadata for `@loopback/rest` so that it can
  redirect requests to this function when the path and verb match.
- `@requestBody()` associates the OpenAPI schema for a Todo with the body of the
  request so that LoopBack can validate the format of an incoming request.

Some additional things to note about this example:

- Routes like `@get('/todos/{id}')` can be paired with the `@param.path`
  decorators to inject those values at request time into the handler function.
- LoopBack's `@param` decorator also contains a namespace full of other
  "subdecorators" like `@param.path`, `@param.query`, and `@param.header` that
  allow specification of metadata for those parts of a REST request.
- LoopBack's `@param.path` and `@param.query` also provide subdecorators for
  specifying the type of certain value primitives, such as
  `@param.path.number('id')`.

Now that we've wired up the controller, our last step is to tie it all into the
[Application](todo-tutorial-putting-it-together.md)!

### Navigation

Previous step: [Add a repository](todo-tutorial-repository.md)

Final step: [Putting it all together](todo-tutorial-putting-it-together.md)
