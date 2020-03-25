---
lang: en
title: 'Querying data'
keywords: LoopBack 4.0, LoopBack 4
layout: readme
source: loopback-next
file: packages/metadata/README.md
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Querying-data.html
summary: --
---

## Overview

A _query_ is a read operation on models that returns a set of data or results.
As we introduced in [Working with data](Working-with-data.md), repositories add behavior to models. Once you have them set up, you can query instances using a Node.js API and a REST API with _filters_ as outlined in the following table. Filters specify criteria for the returned data set.
The capabilities and options of the two APIs are the same. The only difference is the syntax used in HTTP requests versus Node function calls. In both cases, LoopBack models return JSON.

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
        <code><a href="https://apidocs.loopback.io/loopback/#persistedmodel-find" class="external-link">find(filter, callback)</a></code>
        Where filter is a JSON object containing the query filters.
        See <a href="Querying-data.html">Filters</a> below.
      </td>
      <td>
         <code>GET /<em>modelName</em>?filter...</code>
        See <a href="PersistedModel-REST-API.html#find-matching-instances">Model REST API - Find matching instances</a>.
        <span>See </span><a href="Querying-data.html">Filters</a> <span> below.</span>
      </td>
    </tr>
    <tr>
      <td>Find first model instance using specified filters.</td>
      <td>
        <code><a href="https://apidocs.loopback.io/loopback/#persistedmodel-findone" class="external-link">findOne(filter, callback)</a></code>
        Where filter is a JSON object containing the query filters.
        <span>See </span><a href="Querying-data.html">Filters</a> <span> below.</span>
      </td>
      <td>
        <code><span>GET /<em>modelName</em>/findOne?filter...</span></code>
        See <a href="PersistedModel-REST-API.html#find-first-instance">Model REST API - Find first instance</a>.
        <span>See </span><a href="Querying-data.html">Filters</a> <span> below.</span>
      </td>
    </tr>
    <tr>
      <td>Find instance by ID.</td>
      <td>
        <code><a href="https://apidocs.loopback.io/loopback/#persistedmodel-findbyid" class="external-link">findById(id, [filter,] callback)</a></code>
        Where optional filter is a JSON object <span>containing the query filters.</span>
        <span><span>See </span><a href="Querying-data.html">Filters</a> <span> below.</span></span>

      </td>
      <td>
        <code><span>GET /</span><em>modelName</em><span>/</span><em>modelID</em></code>
        See <a href="PersistedModel-REST-API.html#find-instance-by-id">Model REST API - Find instance by ID</a>.
      </td>
    </tr>
  </tbody>
</table>

LB4 supports standard REST syntax and also "stringified JSON" in REST queries. Please read on to see more details and examples of different types of `filter` and example usages of REST API.

## Filters

LoopBack supports the following filters:

* [Fields filter](Fields-filter.html)
* [Include filter](Include-filter.html)
* [Limit filter](Limit-filter.html)
* [Order filter](Order-filter.html)
* [Skip filter](Skip-filter.html)
* [Where filter](Where-filter.html)

More additional examples of each kind of filter can be found in the individual articles on filters (for example [Where filter](Where-filter.md)). Those examples show different syntaxes in REST and Node.js.

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
      <td>fields</td>
      <td>Object, Array, or String</td>
      <td>
        Specify fields to include in or exclude from the response.
        See <a href="Fields-filter.html">Fields filter</a>.
      </td>
    </tr>
    <tr>
      <td>include</td>
      <td>String, Object, or Array</td>
      <td>
        Include results from related models, for relations such as <em>belongsTo</em> and <em>hasMany</em>.
        See <a href="Include-filter.html">Include filter</a>.
      </td>
    </tr>
    <tr>
      <td>limit</td>
      <td>Number</td>
      <td>
        Limit the number of instances to return.
        See <a href="Limit-filter.html">Limit filter</a>.
      </td>
    </tr>
    <tr>
      <td>order</td>
      <td>String</td>
      <td>
        Specify sort order: ascending or descending.
        See <a href="Order-filter.html">Order filter</a>.
      </td>
    </tr>
    <tr>
      <td>skip (offset)</td>
      <td>Number</td>
      <td>
        Skip the specified number of instances.
        See <a href="Skip-filter.html">Skip filter</a>.
      </td>
    </tr>
    <tr>
      <td>where</td>
      <td>Object</td>
      <td>
        Specify search criteria; similar to a WHERE clause in SQL.
        See <a href="Where-filter.html">Where filter</a>.
      </td>
    </tr>
  </tbody>
</table>

The following is an example of using the `find()` method with both a _where_ and a _limit_ filter:

```ts
await accountRepository.find({where: {name: 'John'}, limit: 3});
```

Equivalent using REST:

`/accounts?filter[where][name]=John&filter[limit]=3`

## Syntax

In both Node.js API and REST, you can use any number of filters to define a query.

### REST syntax

Specify filters in the [HTTP query string](http://en.wikipedia.org/wiki/Query_string):

`/modelName?filter=[filterType1]=val1&filter[filterType2]=val2...`

or

`/modelName/id?filter=[filterType1]=val1&filter[filterType2]=val2...`

The number of filters that you can apply to a single request is limited only by the maximum URL length, which generally depends on the client used.

{% include important.html content="
There is no equal sign after `?filter` in the query string; for example
`http://localhost:3000/api/books?filter[where][id]=1` 
" %}

{% include note.html content="See [https://github.com/hapijs/qs](https://github.com/hapijs/qs) for more details.
" %}

### Node syntax

Specify filters as the first argument to `find()` and `findOne()`: 

```javascript
{ filterType: spec, filterType: spec, ... }
```

There is no theoretical limit on the number of filters you can apply.

Where:

* _filterType_ is the filter: [where](Where-filter.html), [include](Include-filter.html), [order](Order-filter.html),
  [limit](Limit-filter.html), [skip](Skip-filter.html), or [fields](Fields-filter.html).
* _spec_ is the specification of the filter: for example for a _where_ filter, this is a logical condition that the results must match.
  For an _include_ filter it specifies the related fields to include.

### Using "stringified" JSON in REST queries

Instead of the standard REST syntax described above, you can also use "stringified JSON" in REST queries.
To do this, simply use the JSON specified for the Node syntax, as follows:

`?filter={ Stringified-JSON }`

where _Stringified-JSON_ is the stringified JSON from Node syntax. However, in the JSON all text keys/strings must be enclosed in quotes (").

{% include important.html content="
When using stringified JSON, you must use an equal sign after `?filter` in the query string.

For example: `http://localhost:3000/api/books?filter={%22where%22:{%22id%22:2}}` 
" %}

For example: `GET /api/activities/findOne?filter={"where":{"id":1234}}`

### Build filters with FilterBuilder

Besides writing the filter yourself, you can also use [`FilterBuilder`](https://loopback.io/doc/en/lb4/apidocs.repository.filterbuilder.html) to help you create or combine `where` clauses. 

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

Another usage of [`FilterBuilder`](https://loopback.io/doc/en/lb4/apidocs.repository.filterbuilder.html) is to combine the `where` clause by using `FilterBuilder.impose`. For example,

```ts
const filter = new FilterBuilder()
  .limit(5)
  .where({id: 101});
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

This also can be done with the [`WhereBuilder`](https://loopback.io/doc/en/lb4/apidocs.repository.wherebuilder.html). See more examples in the [`Where Filter`](Where-filter.md#wherebuilder) page.

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
1. Prohibits hidden/protected properties from being searched
[Hidden or protected properties](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#hidden-properties)
can expose sensitive information if they are allowed to be searched.
LoopBack introduces `prohibitHiddenPropertiesInQuery` setting at datasource/model level to control
if hidden/protected properties can be used in the `where` object. By default, its value is `true`.
For example, 
{% include code-caption.html content="datasources/db.datasources.config.json" %}

```json
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

`myModelRepository.find({where: {secret: 'guess'}});` will be sanitized as `myModelRepository.find({where: {}};` and a warning will be printed on the console:

```sh
Potential security alert: hidden/protected properties ["secret"] are used in query.
```

2. Reports circular references
If the filter object has circular references, LoopBack throws an error as follows:

```js
{
  message: 'The query object is circular',
  statusCode: 400,
  code: 'QUERY_OBJECT_IS_CIRCULAR'
}
```
3. Constrains the maximum depth of query and data objects
Deep filter objects may be mapped to very complex queries that can potentially break your application.
To mitigate such risks, LoopBack allows you to configure `maxDepthOfQuery` and `maxDepthOfData` in datasource/model settings. The default value is `12`. Please note the `depth` is calculated based on the
level of child properties of an JSON object.
For example:
{% include code-caption.html content="datasources/db.datasources.config.json" %}

```json
{
  "db": {
    "name": "db",
    "connector": "memory",
    "maxDepthOfQuery": 5,
    "maxDepthOfData": 16
  }
}
```
If the filter or data object exceeds the maximum depth, an error will be reported:

```js
{
  message: 'The query object exceeds maximum depth 5',
  statusCode: 400,
  code: 'QUERY_OBJECT_TOO_DEEP'
}
```
