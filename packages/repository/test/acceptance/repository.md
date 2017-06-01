# Repostory

Repository is specialized service that provides strong-typed CRUD operations
of a domain model against the datasource.

Repository ~= Model + DataSource

# Generic repository interface

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
the repository resposbility/capability into the controller.

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

# Declare repositories in JSON/YAML

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

# Other considerations

## Caching
## Security
## Tracing/monitoring/logging

# References
- https://martinfowler.com/eaaCatalog/repository.html
- https://msdn.microsoft.com/en-us/library/ff649690.aspx
- http://docs.spring.io/spring-data/data-commons/docs/2.0.0.M3/reference/html/#repositories

