---
lang: en
title: 'Querying data'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Querying-data.html
---

## Overview

A _query_ is a read operation on models that returns a set of data or results.
As we introduced in [Working with data](Working-with-data.md), repositories add
behavior to models. Once you have them set up, you can query instances using a
Node.js API and a REST API with _filters_ as outlined in the following table.
Filters specify criteria for the returned data set. The capabilities and options
of the two APIs are the same. The only difference is the syntax used in HTTP
requests versus Node function calls. In both cases, LoopBack models return JSON.

<table>
  <thead>
    <tr>
      <th>Query</th>
      <th>Model API (Node)</th>
      <th>REST API</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        Find all model instances using specified filters.
      </td>
      <td>
        <code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.find.html" class="external-link">find(filter, options?)</a></code>
        Where filter is a JSON object containing the query filters.
      </td>
      <td>
         <code>GET /<em>modelName</em>?filter...</code>
      </td>
    </tr>
    <tr>
      <td>Find first model instance using specified filters.</td>
      <td>
        <code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.findone.html" class="external-link">findOne(filter, options?)</a></code>
        Where filter is a JSON object containing the query filters.
      </td>
      <td>
        <code><span>GET /<em>modelName</em>/findOne?filter...</span></code>
      </td>
    </tr>
    <tr>
      <td>Find instance by ID.</td>
      <td>
        <code><a href="https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.findbyid.html" class="external-link">findById(id, filter?, options?)</a></code>
        Where optional filter is a JSON object <span>containing the query filters.</span>
      </td>
      <td>
        <code><span>GET /</span><em>modelName</em><span>/</span><em>modelID</em></code>
      </td>
    </tr>
  </tbody>
</table>

LB4 supports standard REST syntax and also "stringified JSON" in REST queries.
Please read on to see more details and examples of different types of `filter`
and example usages of REST API.

## Filters

LoopBack supports a specific filter syntax: it's a lot like SQL, but designed
specifically to serialize safely without injection and to be native to
JavaScript.

LoopBack 4 supports the following kinds of filters:

- [Fields filter](Fields-filter.md)
- [Include filter](Include-filter.md)
- [Limit filter](Limit-filter.md)
- [Order filter](Order-filter.md)
- [Skip filter](Skip-filter.md)
- [Where filter](Where-filter.md)

More additional examples of each kind of filter can be found in the individual
articles on filters (for example [Where filter](Where-filter.md)). Those
examples show different syntaxes in REST and Node.js.

The following table describes LoopBack's filter types:

<table>
  <thead>
    <tr>
      <th>Filter type</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>fields</code></td>
      <td>Object, Array, or String</td>
      <td>
        Specify fields to include in or exclude from the response.
        See <a href="Fields-filter.html">Fields filter</a>.
      </td>
    </tr>
    <tr>
      <td><code>include</code></td>
      <td>String, Object, or Array</td>
      <td>
        Include results from related models, for relations such as <em>belongsTo</em> and <em>hasMany</em>.
        See <a href="Include-filter.html">Include filter</a>.
      </td>
    </tr>
    <tr>
      <td><code>limit</code></td>
      <td>Number</td>
      <td>
        Limit the number of instances to return.
        See <a href="Limit-filter.html">Limit filter</a>.
      </td>
    </tr>
    <tr>
      <td><code>order</code></td>
      <td>String</td>
      <td>
        Specify sort order: ascending or descending.
        See <a href="Order-filter.html">Order filter</a>.
      </td>
    </tr>
    <tr>
      <td><code>skip</code> (offset)</td>
      <td>Number</td>
      <td>
        Skip the specified number of instances.
        See <a href="Skip-filter.html">Skip filter</a>.
      </td>
    </tr>
    <tr>
      <td><code>where</code></td>
      <td>Object</td>
      <td>
        Specify search criteria; similar to a WHERE clause in SQL.
        See <a href="Where-filter.html">Where filter</a>.
      </td>
    </tr>
  </tbody>
</table>

The following is an example of using the `find()` method with both a _where_ and
a _limit_ filter:

```ts
await accountRepository.find({where: {name: 'John'}, limit: 3});
```

Equivalent using REST:

`/accounts?filter[where][name]=John&filter[limit]=3`

## Syntax

In both Node.js API and REST, you can use any number of filters to define a
query.

### Node.js syntax

Specify filters as the first argument to `find*()`:

```ts
{ filterType: spec, filterType: spec, ... }
```

There is no theoretical limit on the number of filters you can apply.

Where:

- *filterType* is the filter: [where](Where-filter.md),
  [include](Include-filter.md), [order](Order-filter.md),
  [limit](Limit-filter.md), [skip](Skip-filter.md), or
  [fields](Fields-filter.md).
- *spec* is the specification of the filter: for example for a *where* filter,
  this is a logical condition that the results must match. For
  an *include* filter it specifies the related fields to include.

### REST syntax

Specify filters in
the [HTTP query string](http://en.wikipedia.org/wiki/Query_string):

`/modelName?filter=[filterType1]=val1&filter[filterType2]=val2...`

or

`/modelName/id?filter=[filterType1]=val1&filter[filterType2]=val2...`

The number of filters that you can apply to a single request is limited only by
the maximum URL length, which generally depends on the client used.

{% include important.html content="
There is no equal sign after `?filter` in the query string; for example
`http://localhost:3000/api/books?filter[where][id]=1` 
" %}

If the filter gets too long, you can encode it. For example:

```ts
const filter = {
  include: [
    {
      relation: 'orders',
      scope: {
        include: [{relation: 'manufacturers'}],
      },
    },
  ],
};

encodeURIComponent(JSON.stringify(filter));
```

the url would be:

`/customers?filter=<encodeResult>`

{% include important.html content=" A REST query must include the literal string
\"filter\" in the URL query string. The Node.js API call does not include the
literal string \"filter\" in the JSON.
" %}

{% include tip.html content="
If you are trying [query filters](#filters) with curl, use the `-g` or `--globoff`  option to use brackets `[` and `]` in request URLs.
" %}

### Using "stringified" JSON in REST queries

Instead of the standard REST syntax described above, you can also use
"stringified JSON" in REST queries. To do this, simply use the JSON specified
for the Node.js syntax, as follows:

`?filter={ Stringified-JSON }`

where *Stringified-JSON* is the stringified JSON from Node.js syntax. However,
in the JSON all text keys/strings must be enclosed in quotes (").

{% include important.html content=" When using stringified JSON, you must use an
equal sign after `?filter` in the query string.

For example: `http://localhost:3000/books?filter={%22where%22:{%22id%22:2}}`  "
%}

For example: `GET /api/activities/findOne?filter={"where":{"id":1234}}`

### Build filters with FilterBuilder

Besides writing the filter yourself, you can also use
[`FilterBuilder`](https://loopback.io/doc/en/lb4/apidocs.repository.filterbuilder.html)
to help you create or combine `where` clauses.

For example, you can build the filter

```ts
const filter = {
  where: {id: 3},
  include: [{relation: 'orders', scope: {where: {name: 'toy'}}]
};
```

with the `FilterBuilder`:

```ts
import FilterBuilder from '@loopback/repository';
...
const filterBuilder = new FilterBuilder();
    filterBuilder
    .include(
      {relation: 'orders', scope: {where: {name: 'ray'}}},
    )
    .where({id:3})
    .build();
```

Another usage of
[`FilterBuilder`](https://loopback.io/doc/en/lb4/apidocs.repository.filterbuilder.html)
is to combine the `where` clause by using `FilterBuilder.impose`. For example,

```ts
const filter = new FilterBuilder().limit(5).where({id: 101});
filter.impose({where: {id: 999, name: 'LoopBack'}});
```

The `where` clauses is combined as:

```ts
{
  limit: 5,
  where: {
      and: [{id: 101}, {id: 999, name: 'LoopBack'}],
  }
}
```

This also can be done with the
[`WhereBuilder`](https://loopback.io/doc/en/lb4/apidocs.repository.wherebuilder.html).
See more examples in the [`Where Filter`](Where-filter.md#wherebuilder) page.

<!-- TODO: (Agnes) need to double check.
### Filtering nested properties

LoopBack supports filtering nested properties in three NoSQL connectors: MongoDB, Cloudant, and memory.
For example, model `User` contains a nested property `user.address.tags.tag`:
```javascript
db.define('User', {
  name: {type: String, index: true},
  email: {type: String, index: true},
  address: {
    street: String,
    city: String,
    tags: [
      {
        tag: String,
      }
    ]
  }
});
```
users can do a nested query like `User.find({where: {'address.tags.tag': 'business'}}`.
Data source connectors for relational databases don't support filtering nested properties. -->

### Sanitizing filter and data objects

<!-- TODO: (Agnes) need to double check.

Filters are very powerful and flexible. To prevent them from creating potential security risks,
LoopBack sanitizes filter objects as follows:
1. Normalizes `undefined` values
The policy is controlled by the `normalizeUndefinedInQuery` setting at datasource or model
level. There are three options:
- 'nullify': Set `undefined` to `null`
- 'throw': Throw an error if `undefined` is found
- 'ignore': Remove `undefined`. This is the default behavior if `normalizeUndefinedInQuery`
  is not configured
For example:
{% include code-caption.html content="datasources/db.datasources.config.json" %}

```json
{
  "db": {
    "name": "db",
    "connector": "memory",
    "normalizeUndefinedInQuery": "ignore"
  }
}
```

{% include code-caption.html content="server/model-config.json" %}

```json
{
  "project": {
    "dataSource": "db",
    "public": true,
    "normalizeUndefinedInQuery": "throw"
  }
}
``` -->

#### Prohibits hidden/protected properties from being searched

[Hidden or protected properties](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#hidden-properties)
can expose sensitive information if they are allowed to be searched. LoopBack
introduces `prohibitHiddenPropertiesInQuery` setting at datasource/model level
to control if hidden/protected properties can be used in the `where` object. By
default, its value is `true`. For example,

{% include code-caption.html content="datasources/db.datasources.config.json" %}

```js
{
  "db": {
    "name": "db",
    "connector": "memory",
    "prohibitHiddenPropertiesInQuery": true
  }
}
```

With the following model definition:

```ts
@model(
settings:{hidden:['secret']}}
)
export class MyModel extends Entity {
  // other props

  @property({
    type: 'string',
  })
  secret?: string;
  //...
}
```

`myModelRepository.find({where: {secret: 'guess'}});` will be sanitized as
`myModelRepository.find({where: {}};` and a warning will be printed on the
console:

```sh
Potential security alert: hidden/protected properties ["secret"] are used in query.
```

#### Reports circular references

If the filter object has circular references, LoopBack throws an error as
follows:

```js
{
  message: 'The query object is circular',
  statusCode: 400,
  code: 'QUERY_OBJECT_IS_CIRCULAR'
}
```

#### Constrains the maximum depth of query and data objects

Deep filter objects may be mapped to very complex queries that can potentially
break your application. To mitigate such risks, LoopBack allows you to configure
`maxDepthOfQuery` and `maxDepthOfData` in datasource/model settings. The default
value is `12`. Please note the `depth` is calculated based on the level of child
properties of an JSON object. For example:

{% include code-caption.html content="datasources/db.datasources.config.json" %}

```js
{
  "db": {
    "name": "db",
    "connector": "memory",
    "maxDepthOfQuery": 5,
    "maxDepthOfData": 16
  }
}
```

If the filter or data object exceeds the maximum depth, an error will be
reported:

```js
{
  message: 'The query object exceeds maximum depth 5',
  statusCode: 400,
  code: 'QUERY_OBJECT_TOO_DEEP'
}
```
