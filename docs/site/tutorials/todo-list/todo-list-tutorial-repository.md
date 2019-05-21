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

From inside the project folder, run the `lb4 repository` command to create a
repository for the `TodoList` model using the `db` datasource. The `db`
datasource shows up by its class name `DbDataSource` from the list of available
datasources.

```sh
lb4 repository
? Please select the datasource DbDatasource
? Select the model(s) you want to generate a repository TodoList
   create src/repositories/todo-list.repository.ts
   update src/repositories/index.ts
? Please select the repository base class DefaultCrudRepository (Legacy juggler
bridge)

Repository TodoList was created in src/repositories/
```

From there, we'll need to make two more additions:

- define the `todos` property, which will be used to build a constrained
  `TodoRepository`
- inject `TodoRepository` instance

Once the property type for `todos` has been defined, use
`this.createHasManyRepositoryFactoryFor` to assign it a repository constraining
factory function. Pass in the name of the relationship (`todos`) and the Todo
repository instance to constrain as the arguments for the function.

{% include code-caption.html content="src/repositories/todo-list.repository.ts" %}

```ts
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
} from '@loopback/repository';
import {Todo, TodoList, TodoListRelations} from '../models';
import {TodoRepository} from './todo.repository';

export class TodoListRepository extends DefaultCrudRepository<
  TodoList,
  typeof TodoList.prototype.id,
  TodoListRelations
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter(TodoRepository)
    protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {
    super(TodoList, dataSource);
    this.todos = this.createHasManyRepositoryFactoryFor(
      'todos',
      todoRepositoryGetter,
    );
  }
}
```

We're now ready to expose `TodoList` and its related `Todo` API through the
[controller](todo-list-tutorial-controller.md).

### Navigation

Previous step: [Add TodoList model](todo-list-tutorial-model.md)

Last step: [Add TodoList controller](todo-list-tutorial-controller.md)
