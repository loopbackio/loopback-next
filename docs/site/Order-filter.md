---
title: 'Order filter'
lang: en
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Filter
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Order-filter.html
summary:
  An <i>order</i> filter specifies a set of logical conditions to match, similar
  to a ORDER clause in a SQL query.
---

An *order* filter specifies how to sort the results: ascending (ASC) or
descending (DESC) based on the specified property.

### Node.js API

Order by one property:

<pre>
{order: '<i>propertyName</i> <ASC|DESC>'}
</pre>

Order by two or more properties:

<pre>
{order: ['<i>propertyName</i> <ASC|DESC>', '<i>propertyName</i> <ASC|DESC>',...]}
</pre>

Where:

- *propertyName* is the name of the property (field) to sort by.
- `<ASC|DESC>` signifies either ASC for ascending order or DESC for descending
  order.

### REST API

Order by one property:

<pre>
?filter[order]=<i>propertyName</i>%20<ASC|DESC>
</pre>

Order by two or more properties:

<pre>
?filter[order][0]=<i>propertyName</i> <ASC|DESC>&filter[order][1]=<i>propertyName</i> <ASC|DESC>...
</pre>

Where:

- *propertyName* is the name of the property (field) to sort by.
- `<ASC|DESC>` signifies either ASC for ascending order or DESC for descending
  order.

You can also
use [stringified JSON format](Querying-data.md#using-stringified-json-in-rest-queries) in
a REST query.

{% include note.html content="Configure default ordering in [default scope](Model.md#scope).
" %}

### Examples

Return the three most expensive items, sorted by the `price` property:

{% include code-caption.html content="Node.js API" %}

```ts
await itemRepository.find({
  order: 'price DESC',
  limit: 3,
});
```

{% include code-caption.html content="REST" %}

`/items?filter[order]=price%20DESC&filter[limit]=3`

Or stringified JSON format:

`/items?filter={"order":["price DESC"],"limit":3}`
