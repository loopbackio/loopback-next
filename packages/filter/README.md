# @loopback/filter

A set of utility typings and filter builders to aid in constructing LoopBack
filters using the
[builder pattern](https://en.wikipedia.org/wiki/Builder_pattern).

## Overview

This lightweight module provides strongly-typed typings and filter builders to
intuitively construct LoopBack filters to be used against querying a LoopBack
filter-compatible server over the network or within the server itself.

## Installation

{% include note.html content="Already installed `@loopback/repository`? Import from there instead. This package is meant for standalone use without `@loopback/repository`." %}

```sh
npm install --save @loopback/filter
```

## Basic use

### WhereBuilder

The `WhereBuilder` is a builder specifically meant to construct the `where`
portion of the filter.

```ts
import {WhereBuilder} from '@loopback/filter';

const whereBuilder = new WhereBuilder();
const where = whereBuilder
  .between('price', 99, 299)
  .and({brand: 'LoopBack'}, {discount: {lt: 20}})
  .or({instock: true})
  .build();
```

### FilterBuilder

The `FilterBuilder` is a builder to construct the filter as a whole.

```ts
import {FilterBuilder} from '@loopback/filter';

const filterBuilder = new FilterBuilder();
const filter = filterBuilder
  .fields('id', 'a', 'b')
  .limit(10)
  .offset(0)
  .order(['a ASC', 'b DESC'])
  .where({id: 1})
  .build();
```

`FilterBuilder.where()` also accepts an instance of `WhereBuilder`.

```ts
const filterBuilder = new FilterBuilder();
const filter = filterBuilder
  // ...
  .where(where)
  .build();
```

## Advanced use

### Strong typings

The `FilterBuilder` and `WhereBuilder` accept a model or any string-based key
objects' typing for strong typings:

```ts
/**
 * Everything was imported from `@loopback/repository` as `@loopback/filter`
 * is re-exported in that package.
 **/
import {
  FilterBuilder,
  model,
  property,
  WhereBuilder,
} from '@loopback/repository';

@model()
class Todo extends Entity {
  @property({id: true})
  id: number;

  @property()
  title: string;

  @property()
  description: string;

  @property()
  priority: number;
}

const whereBuilder = new WhereBuilder<Todo>();
const where = whereBuilder.between('priority', 1, 3).build();

const filterBuilder = new FilterBuilder<Todo>();
const filter = filterBuilder
  .fields('id', 'title')
  .order(['title DESC'])
  .where(where)
  .build();
```

## API docs

See the API docs for
[FilterBuilder](https://loopback.io/doc/en/lb4/apidocs.filter.filterbuilder.html)
and
[WhereBuilder](https://loopback.io/doc/en/lb4/apidocs.filter.wherebuilder.html)
for more details on the full API.

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
