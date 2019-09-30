# @loopback/rest-crud

REST API controller implementing default CRUD semantics.

## Overview

This module allows applications to quickly expose a model via REST API without
having to implement a custom controller class.

## Installation

```sh
npm install --save @loopback/rest-crud
```

## Basic use

1. Define your model class, e.g. using `lb4 model` tool.

2. Create a Repository class, e.g. using `lb4 repository` tool.

3. Create a REST CRUD controller class for your model.

   ```ts
   const ProductController = defineCrudRestController<
     Product,
     typeof Product.prototype.id,
     'id'
   >(Product, {basePath: '/products'});
   ```

4. Set up dependency injection for the ProductController.

   ```ts
   inject('repositories.ProductRepository')(ProductController, undefined, 0);
   ```

5. Register the controller with your application.

   ```ts
   app.controller(ProductController);
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
