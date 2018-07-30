# lb4 openapi

The `openapi` command generates LoopBack 4 artifacts from an
[OpenAPI specification](https://github.com/OAI/OpenAPI-Specification), including
version 2.0 and 3.0.

## Basic use

```sh
Usage:
  lb4 openapi [<url>] [options]

Options:
  -h,   --help          # Print the generator's options and usage
        --url           # URL or file path of the OpenAPI spec
        --validate      # Validate the OpenAPI spec                  Default: false

Arguments:
  url  # URL or file path of the OpenAPI spec  Type: String  Required: false
```

For example,

```sh
lb4 openapi https://api.apis.guru/v2/specs/api2cart.com/1.0.0/swagger.json
```

## Mappings

We map OpenAPI operations by tag into `controllers` and schemas into `models` as
TypeScript classes or types.

### Schemas

The generator first iterates through the `components.schemas` of the
specification document and maps them into TypeScript classes or types:

- Primitive types --> TypeScript type declaration

```ts
export type Message = string;
```

```ts
export type OrderEnum = 'ascending' | 'descending';
```

- Array types --> TypeScript type declaration

```ts
import {Comment} from './comment.model';
export type Comments = Comment[];
```

- Object type --> TypeScript class definition

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

- Composite type (anyOf|oneOf|allOf) --> TypeScript union/intersection types

```ts
export type IdType = string | number;
```

```ts
import {NewPet} from './new-pet.model.ts';
export type Pet = NewPet & {id: number};
```

Embedded schemas are mapped to TypeScript type literals.

### Operations

The generator groups operations (`paths.<path>.<verb>`) by tags. If no tag is
present, it defaults to `OpenApi`. For each tag, a controller class is generated
to hold all operations with the same tag.

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

## OpenAPI Examples

- https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore-expanded.yaml
- https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/uspto.yaml
- https://api.apis.guru/v2/specs/api2cart.com/1.0.0/swagger.json
- https://api.apis.guru/v2/specs/amazonaws.com/codecommit/2015-04-13/swagger.json
