# @loopback/repository

This module provides a common set of interfaces for interacting with databases.

## Overview

**NOTE**: This module is experimental and evolving. It is likely going to be
refactored and decomposed into multiple modules as we refine the story based on
the legacy `loopback-datasource-juggler` and connector modules from LoopBack
3.x.

This module provides data access facilities to various databases and services.
It contains the constructs for modeling and accessing data. Repositories can be
used alone or as part of a `Controller` implementation.

## Installation

```
$ npm install --save @loopback/repository
```

## Basic use

The repository module provides APIs to define LoopBack 3.x data sources and
models. For example,

```ts
import {
  DataSourceConstructor,
  juggler,
  Entity,
  model,
  ModelDefinition
} from '@loopback/repository';

export const ds: juggler.DataSource = new DataSourceConstructor({
  name: 'db',
  connector: 'memory',
});

@model()
export class Note extends Entity {
  static definition = new ModelDefinition({
    name: 'note',
    properties: {
      id: {name: 'id', type: 'number', id: true},
      title: 'string',
      content: 'string'
    }
  })
};
```
A repository can be created directly using `DefaultCrudRepository`.

```ts
import {DefaultCrudRepository} from '@loopback/repository';
// also import Note and ds from wherever you defined them

  const repo = new DefaultCrudRepository(Note, ds);

  // Bind the repository instance to the 'ctx' Context.
  ctx.bind('repositories.noteRepo').to(repo);
```
Fore more detailed info about the repository usage and implementation with a controller, please refer to [Use Repository](#use-repository)

## Concepts

### Repository

`Repository` represents a specialized `Service` interface that provides
strong-typed data access (for example, CRUD) operations of a domain model
against the underlying database or service.

`Repository` can be defined and implemented by application developers. LoopBack
ships a few predefined `Repository` interfaces for typical CRUD and KV
operations. Such `Repository` implements leverage `Model` definition and
`DataSource` configuration to fulfill the logic for data access.

```js
interface Repository<T extends Model> {}

interface CustomerRepository extends Repository<Customer> {
  find(filter?: Filter, options?: Options): Promise<Customer[]>;
  findByEmail(email: string): Promise<Customer>;
  // ...
}
```

See more examples at:
- [Repository/CrudRepository/EntityRepository](src/repository.ts)
- [KVRepository](src/kv-repository.ts)

### Model

A model describes business domain objects, for example, `Customer`, `Address`,
and `Order`. It usually defines a list of properties with name, type, and other
constraints.

Models can be used for data exchange on the wire or between different systems.
For example, a JSON object conforming to the `Customer` model definition can be
passed in REST/HTTP payload to create a new customer or stored in a document
database such as MongoDB. Model definitions can also be mapped to other forms,
such as relational database schema, XML schema, JSON schema, OpenAPI schema, or
gRPC message definition, and vice versa.

There are two subtly different types of models for domain objects:

- Value Object: A domain object that does not have an identity (ID). Its
  equality is based on the structural value. For example, `Address` can be
  modeled as `Value Object` as two US addresses are equal if they have the same
  street number, street name, city, and zip code values. For example:
  ```json
  {
    "name": "Address",
    "properties": {
      "streetNum": "string",
      "streetName": "string",
      "city": "string",
      "zipCode": "string"
    }
  }
  ```

- Entity: A domain object that has an identity (ID). Its equality is based on
  the identity. For example, `Customer` can be modeled as `Entity` as each
  customer should have a unique customer id. Two instances of `Customer` with
  the same customer id are equal since they refer to the same customer. For
  example:
  ```json
  {
    "name": "Customer",
    "properties": {
      "id": "string",
      "lastName": "string",
      "firstName": "string",
      "email": "string",
      "address": "Address"
    }
  }
  ```

### DataSource

`DataSource` is a named configuration of a connector. The configuration
properties vary by connectors. For example, a datasource for `MySQL` needs to
set the `connector` property to `loopback-connector-mysql` with settings such
as:
```json
{
  "host": "localhost",
  "port": 3306,
  "user": "my-user",
  "password": "my-password",
  "database": "demo"
}
```

When a `DataSource` is instantiated, the configuration properties will be used
to initialize the connector to connect to the backend system.

### Connector

`Connector` is a provider that implements data access or api calls with a
specific backend system, such as a database, a REST service, a SOAP Web Service,
or a gRPC micro-service. It abstracts such interactions as a list of operations
in the form of Node.js methods.

Typically, a connector translates LoopBack query
and mutation requests into native api calls supported by the underlying Node.js
driver for the given backend. For example, a connector for `MySQL` will map
`create` method to SQL INSERT statement, which can be executed through MySQL
driver for Node.js.

### Mixin

`Mixin` is a way of building up classes from reusable components by combining
simpler partial classes, which can be modeled as `Mixin`.

For example, the mixins belows add methods and properties to a base class to
create a new one.

```ts
// Mixin as a function
function timestampMixin(Base) {
  return class extends Base {
    created: Date = new Date();
    modified: Date = new Date();
  }
}

// Mixin as an arrow function
const fullNameMixin = Base => class extends Base {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
};

// The base class
class Customer {
  id: string;
  lastName: string;
  firstName: string;
}

// Mix in timestamp
const CustomerWithTS = timestampMixin(Customer);
// Mix in full name
const CustomerWithTSAndFullName = fullNameMixin(CustomerWithTS);
```

### Type

To support property and parameter typing, LoopBack Next introduces an extensible
typing system to capture the metadata and perform corresponding checks and
coercion. The following types are supported out of box.

- StringType
- BooleanType
- NumberType
- DateType
- BufferType
- AnyType
- ArrayType
- UnionType

## Use Repository
The `Repository` and other interfaces extended from `Repository` provide access
to backend databases and services. Repositories can be used alone or as part
of `Controller` implementation.

At the moment, we only have implementations of `Repository` based on LoopBack
3.x `loopback-datasource-juggler` and connectors. The following steps illustrate
how to define repositories and use them with controllers.

### Define legacy data sources and models

The repository module provides APIs to define LoopBack 3.x data sources and
models. For example,

```ts
import {
  DataSourceConstructor,
  juggler,
  Entity,
  model,
  ModelDefinition
} from '@loopback/repository';

export const ds: juggler.DataSource = new DataSourceConstructor({
  name: 'db',
  connector: 'memory',
});

@model()
export class Note extends Entity {
  static definition = new ModelDefinition({
    name: 'note',
    properties: {
      id: {name: 'id', type: 'number', id: true},
      title: 'string',
      content: 'string'
    }
  })
};
```

**NOTE**: There is no declarative support for data source and model yet in
LoopBack Next. These constructs need to be created programmatically as
illustrated above.

### Define a repository

A repository can be created directly using `DefaultCrudRepository`.

```ts
import {DefaultCrudRepository} from '@loopback/repository';
// also import Note and ds from wherever you defined them

  const repo = new DefaultCrudRepository(Note, ds);

  // Bind the repository instance to the 'ctx' Context.
  ctx.bind('repositories.noteRepo').to(repo);
```

Alternatively, we can define a new Repository subclass and use dependency
injection to resolve the data source and model.

```ts
import {DataSourceType} from '@loopback/repository';

class MyNoteRepository extends DefaultCrudRepository<Entity, string> {
  constructor(
    @inject('models.Note') myModel: typeof Note,
    @inject('dataSources.memory') dataSource: DataSourceType) {
      super(myModel, dataSource);
    }
}
```

### Define a controller

Controllers serve as handlers for API requests. We declare controllers as
classes with optional dependency injection by decorating constructor parameters
or properties.

```ts
import {Context, inject} from '@loopback/context';

import {
  repository,
  Entity,
  Options,
  DataObject,
  EntityCrudRepository,
} from '@loopback/repository';

// The Controller for Note
class NoteController {
  constructor(
    // Use constructor dependency injection to set up the repository
    @repository('noteRepo')
    public noteRepo: EntityCrudRepository<Entity, number>,
  ) {}

  // Create a new note
  create(data: DataObject<Entity>, options?: Options) {
    return this.noteRepo.create(data, options);
  }

  // Find notes by title
  findByTitle(title: string, options?: Options) {
    return this.noteRepo.find({where: {title}}, options);
  }
}
```

Alternatively, the controller can be declared using property injection:

```ts
class NoteController {
  @repository('noteRepo')
  public noteRepo: EntityCrudRepository<Entity, number>;
}
```

### Run the controller and repository together

#### Bind the repository to context

```ts
// Create a context
const ctx = new Context();

// Mock up a predefined repository
const repo = new DefaultCrudRepository(Note, ds);

// Bind the repository instance
ctx.bind('repositories.noteRepo').to(repo);
```

```ts
// Create a context
const ctx = new Context();

// Bind model `Note`
ctx.bind('models.Note').to(Note);

// Bind the in-memory DB dataSource
ctx.bind('dataSources.memory').to(ds);

// Bind the repository class
ctx.bind('repositories.noteRepo').toClass(MyNoteRepository);
```

#### Using the Repository Mixin for Application
A Repository Mixin is available for Application that provides convenience methods for binding and instantiating a repository class. Bound instances can be used anywhere in your application using Dependency Injection. The `.repository(RepositoryClass)` function can be used to bind a repository class to an Application. The mixin will also instantiate any repositories declared by a component in its constructor using the `repositories` key.

Repositories will be bound to the key `repositories.RepositoryClass` where `RepositoryClass` is the name of the Repository class being bound.
```ts
import { Application } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { ProductRepository, CategoryRepository } from './repository';

// Using the Mixin
class MyApplication extends RepositoryMixin(Application) {}

// ProductRepository will be bound to key `repositories.ProductRepository`
const app = new MyApplication({repositories: [ProductRepository]});
// CategoryRepository will be bound to key `repositories.CategoryRepository`
app.repository(CategoryRepository);
```

### Compose repositories and controllers in a context

```ts
async function main() {
  // Create a context
  const ctx = new Context();

  // Mock up a predefined repository
  const repo = new DefaultCrudRepository(Note, ds);

  // Bind the repository instance
  ctx.bind('repositories.noteRepo').to(repo);

  // Bind the controller class
  ctx.bind('controllers.MyController').toClass(NoteController);

  // Resolve the controller
  const controller: NoteController = await ctx.get('controllers.MyController');

  // Create some notes
  await controller.create({title: 't1', content: 'Note 1'});
  await controller.create({title: 't2', content: 'Note 2'});

  // Find notes by title
  const notes = await controller.findByTitle('t1');
  return notes;
}

// Invoke the example
main().then(notes => {
  // It should print `Notes [ { title: 't1', content: 'Note 1', id: 1 } ]`
  console.log('Notes', notes);
});
```

### Mix in a repository into the controller (To be implemented)

This style allows repository methods to be mixed into the controller class
to mimic LoopBack 3.x style model classes with remote CRUD methods. It blends
the repository responsibility/capability into the controller.

```ts
import {EntityCrudRepository} from '../../src/repository';
import {Customer} from '../models/customer';
import {repository} from "../../src/decorator";

/**
 * Use class level @repository decorator to mixin repository methods into the
 * controller class. Think about @repository as a shortcut to @mixin(...)
 */
// Style 1
// Create a repository that binds Customer to mongodbDataSource
@repository(Customer, 'mongodbDataSource')
// Style 2
// Reference a pre-configured repository by name. This is close to LoopBack
// 3.x model-config.json
// @repository('myCustomerRepository')
export class CustomerController {
  // find() will be mixed in
}
```

## Declare pre-defined repositories in JSON/YAML (To be implemented)

Repositories can be declared in JSON/YAML files as follows:

server/repositories.json
```json
{
  "customerRepo": {
    "dataSource": "mysql",
    "model": "Customer",
    "settings": {}
  }
}
```
## Related resources
- https://martinfowler.com/eaaCatalog/repository.html
- https://msdn.microsoft.com/en-us/library/ff649690.aspx
- http://docs.spring.io/spring-data/data-commons/docs/2.0.0.M3/reference/html/#repositories

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing##guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

run 'npm test' from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
