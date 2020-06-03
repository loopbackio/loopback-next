---
title: 'Limit filter'
lang: en
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Filter
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Limit-filter.html
summary:
  A <i>limit</i> filter specifies a set of logical conditions to match, similar
  to a LIMIT clause in a SQL query.
---

A *limit* filter limits the maximum number of records a query returns.

### Node.js API

<pre>
{ limit: <i>n</i> }
</pre>

Where *n* is the maximum number of results (records) to return.

### REST API

<pre>
filter[limit]=<i>n</i>
</pre>

You can also
use [stringified JSON format](Querying-data.html#using-stringified-json-in-rest-queries) in
a REST query.

### Examples

Return only the first five query results:

{% include code-caption.html content="Node.js API" %}

```ts
await orderRepository.find({limit: 5});
```

{% include code-caption.html content="REST" %}

`/orders?filter[limit]=5`

Or stringified JSON format:

`/orders?filter={"limit":5}`
