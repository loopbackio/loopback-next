---
lang: en
title: 'Add a Repository'
keywords: LoopBack 4.0, LoopBack 4
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

A `Repository` represents a specialized `Service` interface that provides
strong-typed data access (for example, CRUD) operations of a domain model
against the underlying database or service.

For more information about Repositories, see
[Repositories](https://loopback.io/doc/en/lb4/Repositories.html).

### Create your repository

From inside the project folder, run the `lb4 repository` command to create a
repository for your to-do model using the `db` datasource from the previous
step. The `db` datasource shows up by its class name `DbDataSource` from the
list of available datasources.

```sh
lb4 repository
? Please select the datasource DbDatasource
? Select the model(s) you want to generate a repository Todo
   create src/repositories/todo.repository.ts
   update src/repositories/index.ts
? Please select the repository base class DefaultCrudRepository (Legacy juggler
bridge)

Repository TodoRepository was created in src/repositories/
```

The `src/repositories/index.ts` file makes exporting artifacts central and also
easier to import.

The newly created `todo.repository.ts` class has the necessary connections that
are needed to perform CRUD operations for our to-do model. It leverages the Todo
model definition and 'db' datasource configuration and retrieves the datasource
using
[Dependency Injection](https://loopback.io/doc/en/lb4/Dependency-injection.html).

Now we can expose the `Todo` API through the
[controller](todo-tutorial-controller.md).

### Navigation

Previous step: [Add a datasource](todo-tutorial-datasource.md)

Next step: [Add a controller](todo-tutorial-controller.md)
