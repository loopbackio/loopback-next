# @loopback/repository

This module provides a common set of interfaces for interacting with databases.

## Overview

**NOTE**: This module is experimental and evolving. It is likely going to be
refactored and decomposed into multiple modules as we refine the story based on
the legacy `loopback-datasource-juggler` and connector modules from LoopBack
3.x.

This module provides data access facilities to various databases and services as
well as the constructs for modeling and accessing those data.

## Installation

```sh
npm install --save @loopback/repository
```

## Basic use

At the moment, we only have implementations of `Repository` based on LoopBack
3.x `loopback-datasource-juggler` and connectors. The following steps illustrate
how to define repositories and use them with controllers.

### Defining a legacy datasource and a model

The repository module provides APIs to define LoopBack 3.x data sources and
models. For example,

```ts
// src/datasources/db.datasource.ts
import {juggler, DataSourceConstructor} from '@loopback/repository';

export const db: juggler.DataSource = new DataSourceConstructor({
  name: 'db',
  connector: 'memory',
});
```

```ts
// src/models/note.model.ts
import {model, Entity, property} from '@loopback/repository';

@model()
export class Note extends Entity {
  @property({id: true})
  id: string;
  @property() title: string;
  @property() content: string;
}
```

**NOTE**: There is no declarative support for data source and model yet in
LoopBack 4. These constructs need to be created programmatically as
illustrated above.

### Defining a repository

A repository can be created by extending `DefaultCrudRepository` and using
dependency injection to resolve the datasource.

```ts
// src/repositories/note.repository.ts
import {DefaultCrudRepository, DataSourceType} from '@loopback/repository';
import {Note} from '../models';
import {inject} from '@loopback/core';

export class NoteRepository extends DefaultCrudRepository<
  Note,
  typeof Note.prototype.id
> {
  constructor(@inject('datasources.db') protected dataSource: DataSourceType) {
    super(Note, dataSource);
  }
}
```

### Defining a controller

Controllers serve as handlers for API requests. We declare controllers as
classes with optional dependency injection by decorating constructor parameters
or properties.

```ts
// src/controllers/note.controller.ts
import {repository} from '@loopback/repository';
import {NoteRepository} from '../repositories';
import {Note} from '../models';
import {post, requestBody, get, param} from '@loopback/openapi-v3';

export class NoteController {
  constructor(
    // Use constructor dependency injection to set up the repository
    @repository(NoteRepository.name) public noteRepo: NoteRepository,
  ) {}

  // Create a new note
  @post('/note')
  create(@requestBody() data: Note) {
    return this.noteRepo.create(data);
  }

  // Find notes by title
  @get('/note/{title}')
  findByTitle(@param.path.string('title') title: string) {
    return this.noteRepo.find({where: {title}});
  }
}
```

### Run the controller and repository together

#### Using the Repository Mixin for Application

A Repository Mixin is available for Application that provides convenience
methods for binding and instantiating a repository class. Bound instances can be
used anywhere in your application using Dependency Injection.
The `.repository(RepositoryClass)` function can be used to bind a repository
class to an Application. The mixin will also instantiate any repositories
declared by a component in its constructor using the `repositories` key.

Repositories will be bound to the key `repositories.RepositoryClass` where
`RepositoryClass` is the name of the Repository class being bound.

We'll use `BootMixin` on top of `RepositoryMixin` so that Repository bindings
can be taken care of automatically at boot time before the application starts.

```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {db} from './datasources/db.datasource';
/* tslint:disable:no-unused-variable */
import {BootMixin, Booter, Binding} from '@loopback/boot';
import {
  RepositoryMixin,
  Class,
  Repository,
  juggler,
} from '@loopback/repository';
/* tslint:enable:no-unused-variable */

export class RepoApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
    this.dataSource(db);
  }
}
```

## Concepts

### Repository

`Repository` represents a specialized `Service` interface that provides
strong-typed data access (for example, CRUD) operations of a domain model
against the underlying database or service.

`Repository` can be defined and implemented by application developers. LoopBack
ships a few predefined `Repository` interfaces for typical CRUD and KV
operations. These `Repository` implementations leverage `Model` definition and
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
set the `connector` property to `loopback-connector-mysql` with settings as
follows:

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

Typically, a connector translates LoopBack query and mutation requests into
native api calls supported by the underlying Node.js driver for the given
backend. For example, a connector for `MySQL` will map `create` method to SQL
INSERT statement, which can be executed through MySQL driver for Node.js.

### Mixin

`Mixin` is a way of building up classes from reusable components by combining
simpler partial classes, which can be modeled as `Mixin`.

For example, the mixins belows add methods and properties to a base class to
create a new one.

```ts
import {Class} from '@loopback/repository';

// Mixin as a function
function timestampMixin<T extends Class<{}>>(Base: T) {
  return class extends Base {
    created: Date = new Date();
    modified: Date = new Date();
  };
}

// The base class
class Customer {
  id: string;
  lastName: string;
  firstName: string;
}

// Mix in timestamp
const CustomerWithTS = timestampMixin(Customer);
```

### Type

To support property and parameter typing, LoopBack 4 introduces an extensible
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
- ObjectType

## Related resources

- <https://martinfowler.com/eaaCatalog/repository.html>
- <https://msdn.microsoft.com/en-us/library/ff649690.aspx>
- <http://docs.spring.io/spring-data/data-commons/docs/2.0.0.M3/reference/html/#repositories>

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
