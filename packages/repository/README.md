# @loopback/repository

This module provides data access facilities to various databases and services.
It contains the constructs for modeling and accessing data.

**NOTE**: This module is experimental and evolving. It is likely going to be
refactored and decomposed into multiple modules as we refine the story based on
the legacy `loopback-datasource-juggler` and connector modules from LoopBack 3.x.

# Concepts

## Repository

`Repository` represents a specialized `Service` interface that provides
strong-typed data access (for example, CRUD) operations of a domain model
against the underlying database or service.

`Repository` can be defined and implemented by application developers. LoopBack
ships a few predefined `Repository` interfaces for typical CRUD and KV operations.
Such `Repository` implements leverage `Model` definition and `DataSource`
configuration to fulfill the logic for data access.

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

## Model

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

## DataSource

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

## Connector

`Connector` is a provider that implements data access or api calls with a
specific backend system, such as a database, a REST service, a SOAP Web Service,
or a gRPC micro-service. It abstracts such interactions as a list of operations
in the form of Node.js methods.

Typically, a connector translates LoopBack query
and mutation requests into native api calls supported by the underlying Node.js
driver for the given backend. For example, a connector for `MySQL` will map
`create` method to SQL INSERT statement, which can be executed through MySQL
driver for Node.js.

## Mixin

`Mixin` is a way of building up classes from reusable components by combining
simpler partial classes, which can be modeled as `Mixin`.

For example, the mixins belows add methods and properties to a base class to
create a new one.

```js
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

## Type

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

# Use Repository

## Basic CRUD operations

```js
export interface BasicCRUDRepository<T extends Model> {
  create(data: ModelData, options?: Options): Promise<T>;
  find(Filter, options?: Options);
  delete(Where, options?: Options);
  update(data: ModelData, where?: Where, options?: Options);
  count(where?: Where, options?: Options);
}
```

## Entity CRUD operations
```js
export interface EntityCRUDRepository<ID, T extends Entity> extends BasicCRUDRepository<T> {
  findById(id: ID, filter?: Filter, options?: Options): Promise<T>;
  deleteById(id: ID, options?: Options): Promise<boolean>;
  updateById(id: ID, data: EntityData, options?: Options): Promise<boolean>;
  replaceById(id: ID, data: EntityData, options?: Options): Promise<boolean>;
  // ...
}
```

## KV operations

# Default implementation of CRUD repository

# Leverage loopback-datasource-juggler

# Create specific repository interfaces

# Bind repositories to the container

# Use repositories in a controller

## Use constructor injection
```js
import {EntityCrudRepository} from '../../src/repository';
import {repository} from '../../src/decorator';
import {Customer} from '../models/customer';

export class CustomerController {
  constructor(
    // Use constructor dependency injection
    @repository(Customer, 'mongodbDataSource')
    private repository: EntityCrudRepository<Customer, string>) {
  }

  find() {
    return this.repository.find();
  }
}
```

## Use property injection
```js
import {EntityCrudRepository} from '../../src/repository';
import {repository} from '../../src/decorator';
import {Customer} from '../models/customer';

export class CustomerController {
  // Use property dependency injection
  @repository(Customer, 'mongodbDataSource')
  private repository: EntityCrudRepository<Customer, string>;

  find() {
    return this.repository.find();
  }
}
```

## Use mixins

This style allows repository methods to be mixed into the controller class
to mimic LoopBack 3.x style model classes with remote CRUD methods. It blends
the repository responsibility/capability into the controller.

```js
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

# Declare pre-defined repositories in JSON/YAML (To be implemented)

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

# References
- https://martinfowler.com/eaaCatalog/repository.html
- https://msdn.microsoft.com/en-us/library/ff649690.aspx
- http://docs.spring.io/spring-data/data-commons/docs/2.0.0.M3/reference/html/#repositories

