---
lang: en
title: 'Add TodoList Repository'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-list-tutorial-repository.html
summary: LoopBack 4 TodoList Application Tutorial - Add TodoList Repository
---

### Repositories with related models

One great feature of a related model's repository is its ability to expose a
factory function (a function that returns a newly instantiated object) to return
a 'constrained' version of the related model's repository. A factory function is
useful because it allows you to create a repository whose operations are limited
by the data set that applies to the factory function.

In this section, we'll build `TodoListRepository` to have the capability of
building a constrained version of `TodoRepository`.

### Create your repository

In the `src/repositories` directory:

- create `todo-list.repository.ts`
- update `index.ts` to export the newly created repository

Like `TodoRepository`, we'll use `DefaultCrudRepository` to extend our
`TodoListRepository`. Since we're going to be using the same database used for
`TodoRepository`, inject `datasources.db` in this repository as well. From there
we'll need to make two more additions:

- define the `todos` property, which will be used to build a constrained
  `TodoRepository`
- inject `TodoRepository` instance

Once the property type for `todos` has been defined, use
`this._createHasManyRepositoryFactoryFor` to assign it a repository constraining
factory function. Pass in the name of the relationship (`todos`) and the Todo
repository instance to constrain as the arguments for the function.

#### src/repositories/todo-list.repository.ts

```ts
import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {TodoList, Todo} from '../models';
import {inject} from '@loopback/core';
import {TodoRepository} from './todo.repository';

export class TodoListRepository extends DefaultCrudRepository<
  TodoList,
  typeof TodoList.prototype.id
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository(TodoRepository) protected todoRepository: TodoRepository,
  ) {
    super(TodoList, dataSource);
    this.todos = this._createHasManyRepositoryFactoryFor(
      'todos',
      todoRepository,
    );
  }
}
```

We're now ready to expose `TodoList` and its related `Todo` API through the
[controller](todo-list-tutorial-controller.md).

### Navigation

Previous step: [Add TodoList model](todo-list-tutorial-model.md)

Last step: [Add TodoList controller](todo-list-tutorial-controller.md)
