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

Repository TodoListRepository was created in src/repositories/
```

### Navigation

Previous step: [Add TodoList model](todo-list-tutorial-model.md)

Last step: [Add Model Relations](todo-list-tutorial-relations.md)
