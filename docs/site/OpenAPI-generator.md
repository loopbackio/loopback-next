---
lang: en
title: 'OpenAPI generator'
keywords: LoopBack 4.0, LoopBack 4, OpenAPI, Swagger
sidebar: lb4_sidebar
permalink: /doc/en/lb4/OpenAPI-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Generates artifacts from an OpenAPI spec into a LoopBack application.

```sh
lb4 openapi [<url>] [options]
```

### Options

- `--url`: URL or file path of the OpenAPI spec.
- `--validate`: Validate the OpenAPI spec. Default: `false`.
- `--promote-anonymous-schemas`: Promote anonymous schemas as models classes.
  Default: `false`.

### Arguments

`<url>`: URL or file path of the OpenAPI spec. Type: String. Required: false.

### Supported OpenAPI spec versions

- [2.0 (a.k.a. Swagger)](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
- [3.0.x (OpenAPI 3.0)](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md)

Please note Swagger 2.0 specs are converted to OpenAPI 3.0 internally using
[swagger2openapi](https://www.npmjs.com/package/swagger2openapi).

### Interactive Prompts

The tool will prompt you for:

- **URL or file path of the OpenAPI spec** If the url or file path is supplied
  from the command line, the prompt is skipped.
- **Select controllers to be generated** You can select what controllers will be
  generated based on OpenAPI tags.

### Generated artifacts

The command generates the following artifacts:

1.  For each schema under `components.schemas`, a model class or type
    declaration is generated as `src/models/<model-or-type-name>.model.ts`.

Simple types, array types, composite types (allOf/anyOf/oneOf) are mapped to
TypeScript type declarations. Object types are mapped to TypeScript classes.

For example,

{% include code-caption.html content="src/models/message.model.ts" %}

```ts
export type Message = string;
```

{% include code-caption.html content="src/models/order-enum.model.ts" %}

```ts
export type OrderEnum = 'ascending' | 'descending';
```

{% include code-caption.html content="src/models/comments.model.ts" %}

```ts
import {Comment} from './comment.model';
export type Comments = Comment[];
```

{% include code-caption.html content="src/models/cart.model.ts" %}

```ts
import {model, property} from '@loopback/repository';
import {CartShippingZone} from './cart-shipping-zone.model';
import {CartStoreInfo} from './cart-store-info.model';
import {CartWarehouse} from './cart-warehouse.model';

/**
 * The model class is generated from OpenAPI schema - Cart
 * Cart
 */
@model({name: 'Cart'})
export class Cart {
  constructor(data?: Partial<Cart>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  @property({name: 'additional_fields'})
  additional_fields?: {};

  @property({name: 'custom_fields'})
  custom_fields?: {};

  @property({name: 'db_prefix'})
  db_prefix?: string;

  @property({name: 'name'})
  name?: string;

  @property({name: 'shipping_zones'})
  shipping_zones?: CartShippingZone[];

  @property({name: 'stores_info'})
  stores_info?: CartStoreInfo[];

  @property({name: 'url'})
  url?: string;

  @property({name: 'version'})
  version?: string;

  @property({name: 'warehouses'})
  warehouses?: CartWarehouse[];
}
```

{% include code-caption.html content="src/models/id-type.model.ts" %}

```ts
export type IdType = string | number;
```

{% include code-caption.html content="src/models/pet.model.ts" %}

```ts
import {NewPet} from './new-pet.model.ts';
export type Pet = NewPet & {id: number};
```

2. Anonymous schemas of object/array types are generated as inline TypeScript
   type literals or separate model classes/types depending on
   `--promote-anonymous-schemas` flag (default to `false`).

For example, the following OpenAPI spec snippet uses anonymous schemas for
request and response body objects.

```yaml
openapi: 3.0.0
// ...
paths:
  // ...
  /{dataset}/{version}/records:
    post:
      // ...
      operationId: perform-search
      parameters:
        // ...
      responses:
        '200':
          description: successful operation
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  additionalProperties:
                    type: object
        '404':
          description: No matching record found for the given criteria.
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              type: object
              properties:
                criteria:
                  description: >-
                    Uses Lucene Query Syntax in the format of
                    propertyName:value, propertyName:[num1 TO num2] and date
                    range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the
                    response please see the 'docs' element which has the list of
                    record objects. Each record structure would consist of all
                    the fields and their corresponding values.
                  type: string
                  default: '*:*'
                start:
                  description: Starting record number. Default value is 0.
                  type: integer
                  default: 0
                rows:
                  description: >-
                    Specify number of rows to be returned. If you run the search
                    with default values, in the response you will see 'numFound'
                    attribute which will tell the number of records available in
                    the dataset.
                  type: integer
                  default: 100
              required:
                - criteria
```

Without `--promote-anonymous-schemas`, no separate files are generated for
anonymous schemas. The controller class uses inline TypeScript type literals as
shown below.

{% include code-caption.html content="src/controllers/search.controller.ts" %}

```ts
@operation('post', '/{dataset}/{version}/records')
  async performSearch(
    @requestBody()
    body: {
      criteria: string;
      start?: number;
      rows?: number;
    },
    @param({name: 'version', in: 'path'}) version: string,
    @param({name: 'dataset', in: 'path'}) dataset: string,
  ): Promise<
    {
      [additionalProperty: string]: {};
    }[]
  > {
    throw new Error('Not implemented');
  }
```

On contrast, if `lb4 openapi --promote-anonymous-schemas` is used, two
additional model files are generated:

{% include code-caption.html content="src/models/perform-search-body.model.ts" %}

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - performSearchBody
 * performSearchBody
 */
@model({name: 'performSearchBody'})
export class PerformSearchBody {
  constructor(data?: Partial<PerformSearchBody>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.
   */
  @property({name: 'criteria'})
  criteria: string = '*:*';

  /**
   * Starting record number. Default value is 0.
   */
  @property({name: 'start'})
  start?: number = 0;

  /**
   * Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.
   */
  @property({name: 'rows'})
  rows?: number = 100;
}
```

{% include code-caption.html content="src/models/perform-search-response-body.model.ts" %}

```ts
export type PerformSearchResponseBody = {
  [additionalProperty: string]: {};
}[];
```

3. The generator groups operations (`paths.<path>.<verb>`) by tags. If no tag is
   present, it defaults to `OpenApi`. For each tag, a controller class is
   generated as `src/controllers/<tag-name>.controller.ts` to hold all
   operations with the same tag.

Controller class names are derived from tag names. The `x-controller-name`
property of an operation can be used to customize the controller name. Method
names are derived from `operationId`s. They can be configured using
`x-operation-name`.

For example,

```ts
import {operation, param} from '@loopback/rest';
import {DateTime} from '../models/date-time.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by account
 *
 */
export class AccountController {
  constructor() {}

  /**
   * Get list of carts.
   */
  @operation('get', '/account.cart.list.json')
  async accountCartList(
    @param({name: 'params', in: 'query'}) params: string,
    @param({name: 'exclude', in: 'query'}) exclude: string,
    @param({name: 'request_from_date', in: 'query'}) request_from_date: string,
    @param({name: 'request_to_date', in: 'query'}) request_to_date: string,
  ): Promise<{
    result?: {
      carts?: {
        cart_id?: string;
        id?: string;
        store_key?: string;
        total_calls?: string;
        url?: string;
      }[];
      carts_count?: number;
    };
    return_code?: number;
    return_message?: string;
  }> {
    throw new Error('Not implemented');
  }

  /**
   * Update configs in the API2Cart database.
   */
  @operation('put', '/account.config.update.json')
  async accountConfigUpdate(
    @param({name: 'db_tables_prefix', in: 'query'}) db_tables_prefix: string,
    @param({name: 'client_id', in: 'query'}) client_id: string,
    @param({name: 'bridge_url', in: 'query'}) bridge_url: string,
    @param({name: 'store_root', in: 'query'}) store_root: string,
    @param({name: 'shared_secret', in: 'query'}) shared_secret: string,
  ): Promise<{
    result?: {
      updated_items?: number;
    };
    return_code?: number;
    return_message?: string;
  }> {
    throw new Error('Not implemented');
  }

  /**
   * List webhooks that was not delivered to the callback.
   */
  @operation('get', '/account.failed_webhooks.json')
  async accountFailedWebhooks(
    @param({name: 'count', in: 'query'}) count: number,
    @param({name: 'start', in: 'query'}) start: number,
    @param({name: 'ids', in: 'query'}) ids: string,
  ): Promise<{
    result?: {
      all_failed_webhook?: string;
      webhook?: {
        entity_id?: string;
        time?: DateTime;
        webhook_id?: number;
      }[];
    };
    return_code?: number;
    return_message?: string;
  }> {
    throw new Error('Not implemented');
  }
}
```

### OpenAPI Examples

Try out the following specs or your own with `lb4 openapi`:

- [Swagger Petstore API](https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore-expanded.yaml)
- [USPTO Data Set API](https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/uspto.yaml)
- [Swagger API2Cart](https://api.apis.guru/v2/specs/api2cart.com/1.0.0/swagger.json)
- [AWS CodeCommit API](https://api.apis.guru/v2/specs/amazonaws.com/codecommit/2015-04-13/swagger.json)

For more real world OpenAPI specs, see
[https://api.apis.guru/v2/list.json](https://api.apis.guru/v2/list.json).
