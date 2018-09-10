---
lang: en
title: 'Repository Decorators'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_repo.html
---

## Repository Decorators

As a [domain-driven design](https://en.wikipedia.org/wiki/Domain-driven_design)
concept, the repository is a layer between your domain object and data mapping
layers that uses a collection-like interface for accessing domain objects.

In LoopBack, a domain object is usually a TypeScript/JavaScript Class instance.
A typical example of a data mapping layer module could be a database's node.js
driver.

LoopBack repository encapsulates your TypeScript/JavaScript Class instance and
the methods that communicate with your database. It is an interface to implement
data persistence.

Repository decorators are used for defining models (domain objects) for use with
your chosen datasources and for the navigation strategies among models.

If you are not familiar with repository related concepts like `Model`, `Entity`
and `Datasource`, see LoopBack concept [Repositories](Repositories.md) to learn
more.

### Model Decorators

Model is a class that LoopBack builds for you to organize the data that shares
the same configurations and properties. You can use model decorators to define a
model and its properties.

#### Model Decorator

Syntax: `@model(definition?: ModelDefinitionSyntax)`

Model decorator is a class decorator. In LoopBack 4, we inherit the model
definition format from LoopBack 3, which is described in the
[Model definition JSON file](https://loopback.io/doc/en/lb3/Model-definition-JSON-file).
For usage examples, see [Define Models](Repositories.md#define-models)

_Please note we will elaborate more about model and model definition in the
[Model](Model.md) page, and replace the link above with a LoopBack 4 link_

By using a model decorator, you can define a model as your repository's
metadata, which then allows you to choose between two ways of creating the
repository instance:

1. Inject your repository and resolve it with the datasource juggler bridge  
   that's complete with CRUD operations for accessing the model's data. A use
   case can be found in this section:
   [Repository decorator](#repository-decorator)

2. Define your own repository without using the datasource juggler bridge, and
   use an ORM/ODM of your choice.

```ts
// Missing example here
// Will be provided in Model.md
// refer to [example code](https://github.com/strongloop/loopback-next-example/blob/master/services/account-without-juggler/repositories/account/models/Account.ts)
```

#### Property Decorator

Syntax: `@property(definition?: PropertyDefinition)`

The property decorator defines metadata for a property on a Model definition.
The format of property definitions can be found in
[Property definitions](https://loopback.io/doc/en/lb2/Model-definition-JSON-file.html#properties)

For usage examples, see [Define Models](Repositories.md#define-models)

### Repository Decorator

Syntax:

[`@repository(modelOrRepo: string | Class<Repository<Model>> | typeof Entity, dataSource?: string | juggler.DataSource)`](http://apidocs.loopback.io/@loopback%2fdocs/repository.html#repository)

This decorator either injects an existing repository or creates a repository
from a model and a datasource.

The injection example can be found in
[Repository#controller-configuration](Repositories.md#controller-configuration)

To create a repository in a controller, you can define your model and datasource
first, then import them in your controller file:

```ts
// src/controllers/todo.controller.ts
import {Todo} from '../models';
import {db} from '../datasources/db.datasource';
import {repository, EntityCrudRepository} from '@loopback/repository';

export class TodoController {
  @repository(Todo, db)
  todoRepo: EntityCrudRepository<Todo, number>;
  // ...
}
```

If the model or datasource is already bound to the app, you can create the
repository by providing their names instead of the classes. For example:

```ts
// with `datasource` and `Todo` already defined.
app.bind('datasources.db').to(db);
app.bind('models.Todo').to(Todo);

export class TodoController {
  @repository('Todo', 'db')
  repository: EntityCrudRepository<Todo, number>;
  // etc
}
```

### Relation Decorators

_This feature has not yet been released in alpha form. Documentation will be
added here as this feature progresses._

The relation decorator defines the nature of a relationship between two models.

#### Relation Decorator

Syntax: `@relation`

Register a general relation.

_This feature has not yet been released in alpha form. Documentation will be
added here as this feature progresses._

#### Specific Relation Decorator

Syntax:

- `@belongsTo`
- `@hasOne`
- `@hasMany`
- `@embedsOne`
- `@embedsMany`
- `@referencesOne`
- `@referencesMany`

Register a specific relation.

_This feature has not yet been released in alpha form. Documentation will be
added here as this feature progresses._
