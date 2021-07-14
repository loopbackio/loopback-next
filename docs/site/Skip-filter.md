---
title: 'Skip filter'
lang: en
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Filter
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Skip-filter.html
---

A skip filter omits the specified number of returned records. This is useful,
for example, to paginate responses.

Use `offset` as an alias for `skip`.

### Node.js

<pre>
{skip: <i>n</i>}
</pre>

Where _n_ is the number of records to skip.

### REST API

<pre>
?filter[skip]=<i>n</i>
</pre>

You can also
use [stringified JSON format](Querying-data.md#using-stringified-json-in-rest-queries) in
a REST query.

### Examples

To Skip the first three records:

{% include code-caption.html content="Node.js API" %}

```ts
await orderRepository.find({skip: 3});
```

{% include code-caption.html content="REST" %}

`/orders?filter[skip]=3`

Or stringified JSON format:

`/orders?filter={"skip":3}`

**Pagination Example**

The following requests illustrate how to paginate a query result. Each request
request returns ten records: the first returns the first ten, the second returns
the 11th through the 20th, and so on...

{% include code-caption.html content="REST" %}

```
/orders?filter[limit]=10&filter[skip]=0
/orders?filter[limit]=10&filter[skip]=10
/orders?filter[limit]=10&filter[skip]=20
...
```

{% include code-caption.html content="Node.js API" %}

```ts
await orderRepository.find({limit: 10, skip: 0});
await orderRepository.find({limit: 10, skip: 10});
await orderRepository.find({limit: 10, skip: 20});
```
