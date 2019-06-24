---
lang: en
title: 'Defining the API using design-first approach'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Defining-the-API-using-design-first-approach.html
---

{% include important.html content="The top-down approach for building LoopBack
applications is not yet fully supported. Therefore, the steps outlined in this
page are outdated and may not work out of the box. They will be revisited after
our MVP release.
"%}

## Define the API from top to bottom (design-first)

### Start with data

When building an API, its usually easiest to start by outlining some example
data that consumers of the API will need. This can act as the first rough draft
of the API specification for smaller applications / APIs. In this tutorial,
you'll start by sketching out some example API response data as simple
JavaScript objects:

```js
const products = [
  {
    name: 'Headphones',
    price: 29.99,
    category: '/categories/accessories',
    available: true,
    deals: ['50% off', 'free shipping'],
  },
  {
    name: 'Mouse',
    price: 32.99,
    category: '/categories/accessories',
    available: true,
    deals: ['30% off', 'free shipping'],
  },
  {
    name: 'yPhone',
    price: 299.99,
    category: '/categories/phones',
    available: true,
    deals: ['free shipping'],
  },
  {
    name: 'yBook',
    price: 5999.99,
    category: '/categories/computers',
    available: true,
  },
];
```

With the example data defined, you can start to get an idea of how to separate
the data into individual proper nouns, which will eventually be defined in
different ways. Either as resources, schemas, models, or repositories.

- `CatalogItem` - Each object in the array above
- `Category` - Has a URL, and more information about the category
- `Product` - The name, price and other product information
- `Inventory` - The product availability
- `Deals` - Information about promotions on a group of products

### Outline the API

With the proper nouns of the API defined, you can now start to think about what
the API will look like.

This is where you choose how fine or coarse grain the API will be. You have to
decide which proper nouns above will be available as _Resources_. The easiest
way to figure out which Resources are needed is by sketching out the URLs
(without verbs) for the API:

- `/products?{query}` - Search for products in the catalog
- `/product/{slug}` - Get the details for a particular product
- `/deals?{query}` - Search for deals
- `/deal/{slug}` - Get the details for a particular deal
- `/categories?{query}` - Search for categories
- `/category/{slug}` - Get the details for a particular category
- `/category/{slug}/products?{query}` - Search for products in a particular
  category

### Break down the data into resources

With the URLs, defined, its easy to determine which resources you'll need.

- `ProductResource`
- `DealResource`
- `CategoryResource`

This is where it's useful to determine similarities between Resources; for
example, the `ProductResource`, `DealResource`, and `CategoryResource` all have
the same URL structure, with the exception of
`/category/{slug}/products?{query}` path on `CategoryResource`:

- `/{pluralName}?{query}` - Search with a query and the resource plural name
- `/{name}/{slug}` - Get details about the resource

### Using patterns to reduce duplication

It can be tricky to determine the patterns on which to base the API, since
you'll likely want to change it in the future. To keep the patterns flexible,
you can define these patterns via simple TypeScript functions (you can also do
it in JavaScript). Start with a `SearchableResource` pattern, since all of the
resources must support the same search and listing operations.

The `SearchableResource` pattern will define all of the semantics for an OpenAPI
fragment that supports search.

{% include code-caption.html content="/apidefs/templates/searchable-resource.ts"
%}

```ts
export let searchableResource = (resource: any, type: string) => ({
  paths: {
    [`/${resource.path}`]: {
      // pattern
      get: {
        parameters: [
          {
            in: 'query',
            name: 'filter',
            type: 'string',
          },
        ],
        responses: {
          200: {
            description:
              resource.description || `Result set of type ${type} returned.`,
            schema: {
              $ref: `#/definitions/${type}`,
              type: 'array',
            },
          },
        },
        'x-controller-name': resource.controller,
        'x-operation-name': 'search',
      },
    },
    [`/${resource.path}/{slug}`]: {
      // pattern
      get: {
        parameters: [
          {
            in: 'path',
            name: 'slug',
            required: true,
            type: 'string',
          },
        ],
        responses: {
          200: {
            description:
              resource.description || `Result of type ${type} returned.`,
            schema: {
              $ref: `#/definitions/${type}`,
            },
          },
        },
        'x-controller-name': resource.controller,
        'x-operation-name': 'getDetails',
      },
    },
  },
});
```

Here's another example for creating a POST template, called `CreatableResource`.

{% include code-caption.html content="/apidefs/templates/creatable-resource.ts"
%}

```ts
export let creatableResource = (resource: any, type: string) => ({
  paths: {
    [`/${resource.path}`]: {
      // pattern
      post: {
        parameters: [
          {
            in: 'body',
            name: 'body',
            required: true,
            schema: {
              $ref: `#/definitions/${type}`,
            },
          },
        ],
        responses: {
          201: {
            description:
              resource.description || `The ${type} instance was created.`,
            schema: {
              $ref: `#/definitions/${type}`,
            },
          },
        },
        'x-controller-name': resource.controller,
        'x-operation-name': 'create',
      },
    },
  },
});
```

Lastly, you'll create a helper function for generating type definitions in
OpenAPI.

{% include code-caption.html content="/apidefs/templates/type-definition.ts" %}

```ts
import {DefinitionsObject} from '@loopback/openapi-spec';

export let TypeDefinition = (type: any): DefinitionsObject => ({
  definitions: {
    [`${type.name}`]: {
      properties: type.definition,
    },
  },
});
```

Given the pattern function above, you can now create the OpenAPI fragment that
represents the `ProductController` portion of the full specification. This
example, uses [lodash](https://lodash.com/) to help with merging generated
definitions together. Install lodash with this command:

```shell
npm install --save lodash
```

{% include code-caption.html content="/apidefs/product.api.ts" %}

```ts
import * as _ from 'lodash';

// Assuming you have created the "base" schema elsewhere.
// If there are no common properties between all of the endpoint objects,
// then you can ignore this.
import BaseSchema from '../BaseSchema';
// Don't forget to export the template functions under a common file!
import {
  SearchableResource,
  CreatableResource,
  TypeDefinition,
} from './templates';
let ProductAPI: ControllerSpec = {};

const ProductDefinition = {};
// Build type definition using base schema + additional properties.
_.merge(
  ProductDefinition,
  BaseSchema,
  TypeDefinition({
    price: {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true,
    },
  }),
);

const ProductGetResource = SearchableResource(
  {
    controller: 'ProductController',
    operation: 'search',
    path: 'products',
  },
  'Product',
);

const ProductCreateResource = CreatableResource(
  {
    controller: 'ProductController',
    operation: 'create',
    path: 'products',
  },
  'Product',
);
// Rinse and repeat for PUT, PATCH, DELETE, etc...

// Merge all of the objects together.
// This will mix the product definition into the "definitions" property of the
// OpenAPI spec, and the resources will be mixed into the "paths" property.
_.merge(
  ProductAPI,
  ProductDefinition,
  ProductGetResource,
  ProductCreateResource,
);

// And export it!
export default ProductAPI;
```

### Connect OpenAPI fragments to Controllers

By separating each individual "Model"-level API export, you can link them to
their corresponding controllers throughout the application.

{% include code-caption.html content="/controllers/product-controller.ts" %}

```ts
import {api} from '@loopback/core';
import ProductApi from '../apidefs/product.api';

// This decorator binds the Product API to the controller,
// which will establish routing to the specified functions below.
@api(ProductApi)
export class ProductController {
  // Note that the function names here match the strings in the "operation"
  // property you provided to the SearchableResource call in the previous
  // example.
  public search() {
    // your logic here
  }

  // Same goes for this function!
  public create(id: number, name: string, price: number) {
    // your logic here
  }

  // etc...
}
```

### Putting together the final API specification

Now that you've built the OpenAPI fragments for each of the controllers, you can
put them all together to produce the final OpenAPI spec.

{% include code-caption.html content="/apidefs/swagger.ts" %}

```ts
import {ProductAPI, DealAPI, CategoryAPI} from '../apidefs';
import * as OpenApiSpec from '@loopback/openapi-spec';
import * as _ from 'lodash';

// Import API fragments here

export const spec: OpenApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Your API',
    version: '1.0',
  },
  paths: {},
  servers: [{url: '/'}],
};

_.merge(spec, ProductAPI);
_.merge(spec, DealAPI);
_.merge(spec, CategoryAPI);

export default spec;
```

You can then bind the full spec to the application using `app.api()`. This works
well for applications with a single REST server, because there is only one API
definition involved.

If you are building an application with multiple REST servers, where each server
provides a different API, then you need to call `server.api()` instead.

You also need to associate the controllers implementing the spec with the app
using `app.controller(GreetController)`. This is not done on the server level
because a controller may be used with multiple server instances, and types!

```ts
// application.ts
// This should be the export from the previous example.
import spec from '../apidefs/swagger';
import {RestApplication, RestServer} from '@loopback/rest';
import {
  ProductController,
  DealController,
  CategoryController,
} from './controllers';
export class YourMicroservice extends RestApplication {
  constructor() {
    super({
      rest: {
        port: 3001,
      },
    });
    const app = this;

    app.controller(ProductController);
    app.controller(DealController);
    app.controller(CategoryController);
    //inject your spec
    app.api(spec);
  }
  // etc...
}
```

## Validate the API specification

[The OpenAPI Swagger editor](https://editor.swagger.io) is a handy tool for
editing OpenAPI specifications that comes with a built-in validator. It can be
useful to manually validate an OpenAPI specification.

However, manual validation is tedious and error prone. It's better to use an
automated solution that's run as part of a CI/CD workflow. LoopBack's `testlab`
module provides a helper function for checking whether a specification conforms
to OpenAPI Spec. Just add a new Mocha test that calls this helper function to
the test suite:

{% include code-caption.html content="src/__tests__/acceptance/api-spec.acceptance.ts" %}

```ts
import {validateApiSpec} from '@loopback/testlab';
import {MyApp} from '../..';
import {RestServer} from '@loopback/rest';

describe('API specification', () => {
  it('api spec is valid', async () => {
    const app = new MyApp();
    const server = await app.getServer(RestServer);
    const spec = server.getApiSpec();
    await validateApiSpec(apiSpec);
  });
});
```

See
[Validate your OpenAPI specification](Testing-your-application.md#validate-your-openapi-specification)
from [Testing your application](Testing-your-application.md) for more details.

{% include note.html content="
If you would like to make tweaks to your API as you develop your application,
refer to [Defining the API using code-first approach](Defining-the-API-using-code-first-approach.md)
page for best practices.
" %}

{% include next.html content= " [Testing the API](./Testing-the-API.md)
" %}
