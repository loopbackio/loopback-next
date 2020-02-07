# @loopback/rest-crud

REST API controller implementing default CRUD semantics.

## Overview

This module allows applications to quickly expose models via REST API without
having to implement custom controller or repository classes.

## Installation

```sh
npm install --save @loopback/rest-crud
```

## Basic use

`@loopback/rest-crud` can be used along with the built-in `ModelApiBooter` to
easily create a repository class and a controller class for your model. The
following use is a simple approach for this creation, however, you can look at
the "Advanced use" section instead for a more flexible approach.

For the examples in the following sections, we are assuming a model named
`Product` and a datasource named `db` have already been created.

In your `src/application.ts` file:

```ts
// add the following import
import {CrudRestComponent} from '@loopback/rest-crud';

export class TryApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    // other code

    // add the following line
    this.component(CrudRestComponent);
  }
}
```

Create a new file for the configuration, e.g.
`src/model-endpoints/product.rest-config.ts` that defines the `model`,
`pattern`, `dataSource`, and `basePath` properties:

```ts
import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {Product} from '../models';

module.exports = <ModelCrudRestApiConfig>{
  model: Product,
  pattern: 'CrudRest', // make sure to use this pattern
  dataSource: 'db',
  basePath: '/products',
};
```

Now your `Product` model will have a default repository and default controller
class defined without the need for a repository or controller class file.

## Advanced use

If you would like more flexibility, e.g. if you would only like to define a
default `CrudRest` controller or repository, you can use the two helper methods
(`defineCrudRestController` and `defineCrudRepositoryClass`) exposed from
`@loopback/rest-crud`. These functions will help you create controllers and
respositories using code.

For the examples in the following sections, we are also assuming a model named
`Product`, and a datasource named `db` have already been created.

### Creating a CRUD Controller

Here is how you would use `defineCrudRestController` for exposing the CRUD
endpoints of an existing model with a respository.

1. Create a REST CRUD controller class for your model.

   ```ts
   const ProductController = defineCrudRestController<
     Product,
     typeof Product.prototype.id,
     'id'
   >(Product, {basePath: '/products'});
   ```

2. Set up dependency injection for the `ProductController`.

   ```ts
   inject('repositories.ProductRepository')(ProductController, undefined, 0);
   ```

3. Register the controller with your application.

   ```ts
   app.controller(ProductController);
   ```

### Creating a CRUD repository

Use the `defineCrudRepositoryClass` method to create named repositories (based
on the Model) for your app.

Usage example:

```ts
const ProductRepository = defineCrudRepositoryClass(Product);
this.repository(ProductRepository);
inject('datasources.db')(ProductRepository, undefined, 0);
```

### Integrated example

Here is an example of an app which uses `defineCrudRepositoryClass` and
`defineCrudRestController` to fulfill its repository and controller
requirements.

```ts
export class TryApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    // ...
  }

  async boot(): Promise<void> {
    await super.boot();

    const ProductRepository = defineCrudRepositoryClass(Product);
    const repoBinding = this.repository(ProductRepository);

    inject('datasources.db')(ProductRepository, undefined, 0);

    const ProductController = defineCrudRestController<
      Product,
      typeof Product.prototype.id,
      'id'
    >(Product, {basePath: '/products'});

    inject(repoBinding.key)(ProductController, undefined, 0);
    this.controller(ProductController);
  }
}
```

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
