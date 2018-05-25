---
lang: en
title: 'Add a Repository'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-repository.html
summary: LoopBack 4 Todo Application Tutorial - Add a Repository
---

### Repositories

The repository pattern is one of the more fundamental differences between
LoopBack 3 and 4. In LoopBack 3, you would use the model class definitions
themselves to perform CRUD operations. In LoopBack 4, the layer responsible for
this has been separated from the definition of the model itself, into the
repository layer.

### Create your repository

In the `src/repositories` directory, create two files:

- `index.ts` (our export helper)
- `todo.repository.ts`

Our TodoRepository will extend a small base class that uses the
`DefaultCrudRepository` class from
[`@loopback/repository`](https://github.com/strongloop/loopback-next/tree/master/packages/repository)
and will define the model type we're working with, as well as its ID type. This
automatically gives us the basic CRUD methods required for performing operations
against our database (or any other kind of datasource).

We'll also inject our datasource so that this repository can connect to it when
executing data operations.

#### src/repositories/todo.repository.ts

```ts
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Todo} from '../models';
import {inject} from '@loopback/core';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id
> {
  constructor(
    @inject('datasources.db') protected datasource: juggler.DataSource,
  ) {
    super(Todo, datasource);
  }
}
```

Now we have everything we need to perform CRUD operations for our Todo list,
we'll need to build the [Controller](todo-tutorial-controller.md) to handle our incoming
requests.

### Navigation

Previous step: [Add a datasource](todo-tutorial-datasource.md)

Next step: [Add a controller](todo-tutorial-controller.md)
