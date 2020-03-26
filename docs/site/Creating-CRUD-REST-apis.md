---
lang: en
title: 'Creating CRUD REST APIs from a model'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Creating-crud-rest-apis.html
summary:
  Use `@loopback/rest-crud` module to create CRUD REST APIs from a model and a
  datasource
---

Starting with a [model class](Model.md) and [datasource](DataSources.md),
LoopBack 4 allows you to easily use CRUD REST APIs by convention through
[`@loopback/rest-crud`](https://github.com/strongloop/loopback-next/tree/master/packages/rest-crud).
The package allows the application to use a default CRUD repository and
controller class without creating a custom class for either.

The
[`rest-crud` example](https://github.com/strongloop/loopback-next/tree/master/examples/rest-crud)
is a simplified version of the
[`Todo` example](https://github.com/strongloop/loopback-next/tree/master/examples/todo)
that uses `@loopback/rest-crud`. To see the `rest-crud` example, use the
following command:

```sh
lb4 example rest-crud
```

## Use

To use this functionality, you must already have:

- A LoopBack 4 application (e.g. `ExampleApplication`)
- At least one model class (e.g. `Product`)
- At least one datasource (e.g. `db`)

### Model Configuration Options

The
[`ModelCrudRestApiConfig`](https://loopback.io/doc/en/lb4/apidocs.rest-crud.modelcrudrestapiconfig.html)
interface provides some options to define and customize the REST API:

<table>
  <thead>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Example</th>
  </tr>
  </thead>

  <tbody>
  <tr>
    <td><code>model</code></td>
    <td>Name of the model class</td>
    <td><code>Product</code></td>
  </tr>
  <tr>
    <td><code>pattern</code></td>
    <td>Name of data-access pattern</td>
    <td>Always use <code>CrudRest</code></td>
  </tr>
  <tr>
    <td><code>dataSource</code></td>
    <td>Name of the datasource</td>
    <td><code>db</code></td>
  </tr>
  <tr>
    <td><code>basePath</code></td>
    <td>Base path for the REST API</td>
    <td><code>/products</code></td>
  </tr>
  </tbody>
</table>

Using the example attributes above, a model configuration file would be defined
as follows:

{% include code-caption.html content="/src/model-endpoints/product.rest-config.ts" %}

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

### CLI Command

LoopBack 4 offers a CLI command to generate the CRUD REST API:

```sh
lb4 rest-crud [options]
```

For example to create CRUD REST API for `Product` and `db`:

```sh
lb4 rest-crud --datasource db --model Product
```

You can also create it for multiple models at the same time. For more
information on the command, see the
[Rest Crud generator](Rest-Crud-generator.md).

This will generate a model configuration file and add the `CrudRestComponent` to
the application file. For more details, see the following section,
[under the hood](#Under-the-hood).

## Under the Hood

The CLI command installs the `@loopback/rest-crud` dependency. Then, from
`@loopback/rest-crud`, the
[`CrudRestComponent`](https://loopback.io/doc/en/lb4/apidocs.rest-crud.crudrestcomponent.html)
is added to the application class, as it enables the functionality of creating
the CRUD REST APIs from the model and datasource. For example:

{% include code-caption.html content="/src/application.ts" %}

```ts
// adds the following import
import {CrudRestComponent} from '@loopback/rest-crud';

export class ExampleApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    // other code

    // adds the following line
    this.component(CrudRestComponent);
  }
}
```

Then it takes the model class and datasource and creates a model configuration
file. For example:

{% include code-caption.html content="/src/model-endpoints/product.rest-config.ts" %}

```ts
import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {Product} from '../models';

module.exports = <ModelCrudRestApiConfig>{
  model: Product,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/products',
};
```

Under the hood, a default CRUD controller and repository are created using
[`defineCrudControllerClass`](https://loopback.io/doc/en/lb4/apidocs.rest-crud.definecrudrestcontroller.html)
and
[`defineCrudRepositoryClass`](https://loopback.io/doc/en/lb4/apidocs.rest-crud.definecrudrepositoryclass.html),
respectively. These two functions can also be used at the application level. For
example:

```ts
export class ExampleApplication extends BootMixin(
  RepositoryMixin(RestApplication),
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

Creating it in the application file allows you to create your own repository and
only use the default CRUD controller, for example.

## Limitations

Currently, the module doesn't support service-oriented datasources such as REST
or SOAP.
