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

`@loopback/rest-crud` exposes two helper methods (`defineCrudRestController` and
`defineCrudRepositoryClass`) for creating controllers and respositories using
code.

For the examples in the following sections, we are assuming a model named
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

2. Set up dependency injection for the ProductController.

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
    ...
  }

  async boot():Promise<void> {
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
