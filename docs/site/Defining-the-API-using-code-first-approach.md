---
lang: en
title: 'Defining the API using code-first approach'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Defining-the-API-using-code-first-approach.html
---

## Define the API from code-first approach

You may want to build your application from the 'bottom up' if you:

- do not have a complete understanding of what your existing tools can offer.
- want to capture already existing domain models so that they can be reflected
  as APIs for external consumption.
- need to grow and change your API from the initial implementation
- want to set up and run an API from an early stage of the production to easily
  envision the big picture of the end product.

There are various tools available to LoopBack which allows this bottom-up
approach of building your application to be simple through the usages of
metadata and decorators.

### Start with LoopBack artifacts

With TypeScript's
[experimental decorator](https://www.typescriptlang.org/docs/handbook/decorators.html)
feature, APIs can be automatically built and exposed as your application
continues development. Some key concepts utilize decorators to gather _metadata_
about your code and then assemble them into a valid OpenAPI specification, which
provide a description of your API. These concepts and their decorators include:

- [Model](Model.md)
  - `@model()`
  - `@property()`
- [Routes](Routes.md)
  - `@operation()`
  - `@param()`

### Define your models

Your models act as common definitions between data being handled by the API
layer and the datasource layer. Since your API is going to be built around the
manipulation of models and their properties, they will be the first to be
defined.

{% include note.html content="
`Todo` model from [tutorial](https://github.com/strongloop/loopback-next/blob/master/docs/site/todo-tutorial-model.md#srcmodelstodomodelts)
is used for demonstration here.
" %}

First, write a simple TypeScript class describing your model and its properties:

{% include code-caption.html content="src/models/todo.model.ts" %}

```ts
export class Todo {
  id?: number;
  title: string;
  desc?: string;
  isComplete: boolean;
}
```

To this representation of your model, we can use the `@model` and `@property`
decorators to create the model's _metadata_; a model definition. LoopBack and
LoopBack extensions can use this model definition for a wide variety of uses,
such as:

- generating OpenAPI schema for your APIs
- validating instances of the models during the request/response lifecycle
- automatically inferring relationships between models during datasource
  operations

To apply these decorators to your model, you simply prefix the class definition
with the `@model` decorator, and prefix each property with the `@property`
decorator:

{% include code-caption.html content="src/models/todo.model.ts" %}

```ts
import {model, property} from '@loopback/repository';

@model()
export class Todo {
  @property()
  id?: number;
  @property({
    required: true,
  })
  title: string;
  @property()
  desc?: string;
  @property()
  isComplete: boolean;
}
```

### Define your routes

{% include note.html content="
`TodoController` from [tutorial](https://github.com/strongloop/loopback-next/blob/master/docs/site/todo-tutorial-controller.md#srccontrollerstodocontrollerts-2)
is used for demonstration here.
" %}

Once your models are defined, create a controller to host your routes for each
[paths](https://swagger.io/specification/#pathsObject) of your API:

{% include code-caption.html content="src/controllers/todo.controller.ts" %}

```ts
import {Todo} from '../models/todo.model';

export class TodoController {
  constructor() {}

  async createTodo(todo: Todo) {
    // data creating logic goes here
  }

  async findTodoById(id: number, items?: boolean): Promise<Todo> {
    // data retrieving logic goes here
  }

  // ...
}
```

The controller's routes in their current state has no information on which API
endpoints they belong to. Add them in by appending `@operation` to each method
of your routes and `@param` or `@requestBody` to its parameters:

{% include code-caption.html content="src/controllers/todo.controller.ts" %}

```ts
import {Todo} from '../models/todo.model';
import {post, get, param, requestBody} from '@loopback/openapi-v3';

export class TodoController {
  constructor() {}

  @post('/todos') // same as @operation('post', '/todos');
  async createTodo(@requestBody() todo: Todo) {
    // data creating logic goes here
  }

  @get('/todos/{id}')
  async findTodoById(
    @param.path.number('id') id: number,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Todo> {
    // data retrieving logic goes here
  }

  // ...
}
```

Once your routes have been decorated, your application is ready to serve its
API. When an instance of `RestServer` is run, an OpenAPI specification
representing your application's API is built. The spec is generated entirely
from the decorated elements' metadata, which in turn provides routing logic for
your API when your application is running.

### Reviewing your API specification

To review your complete API specification, run your application with the
decorated controllers registered. Once it is running, visit `/openapi.json`
endpoint to access your API specification in JSON format or `/openapi.yaml` for
YAML. Alternatively, the specification file can also be accessed in code through
the `getApiSpec()` function from your `RestServer` instance.

For a complete walkthrough of developing an application with the bottom-up
approach, see our
[Todo application](https://github.com/strongloop/loopback-next/blob/master/examples/todo/README.md)
tutorial.

{% include next.html content= "
[Defining your testing strategy](./Defining-your-testing-strategy.md)
" %}
