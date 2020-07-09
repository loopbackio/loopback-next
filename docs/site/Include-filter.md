---
title: 'Include filter'
lang: en
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Filter
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Include-filter.html
---

An *include* filter enables you to include results from related models in a
query over relations. (See [Relations](Relations.md) for details on how to
define relations)

The value of the include filter can be a string, an array, or an object.

{% include important.html content="You can use an _include_ filter with `find(),` `findOne()` and `findById()` methods.
" %}

### Node.js API

To query one relation:

```ts
{
  include: [{relation: 'relationName'}];
}
```

To query multiple relations:

```ts
{
  include: [{relation: 'relationName1'}, {relation: 'relationName2'}];
}
```

To query nested relations, use the scope field:

```ts
{
    relation: 'relationName',
    scope: {
    include: [{relation: 'nestedRelationName'}],
    },
}
```

Where:

- _relationName_ is the name of a relation defined in repositories. Check
  [Relations](Relations.md) for details.

### REST API

To query one relation: `/modelName?filter[include][][relation]=_relationName_`

To query multiple relations:
`/modelName?filter[include][0][relation]=_relationName1_&filter[include][1][relation]=_relationName2_`

To query nested relations, as the url would get too long, we recommend to encode
it with `encodeURIComponent(JSON.stringify(filter))`:
`/modelName?filter=<encodeResult>`

You can also use
[stringified JSON format](Querying-data.md#using-stringified-json-in-rest-queries) in
a REST query.

#### Scope Filter

Please note if the scope filter contains non-string data, they won't be coerced
if you use the plain query. Only the stringified JSON format works as expected.

For example, the following REST query which includes related `users` without
their names:

`/modelName?filter[include][0][relation]=users&filter[include][0][scope][fields][name]=false`

won't hide the `name` field for `users`, because `false` is a boolean value. It
won't be coerced and will present as a string when passed to the controller
function.

A solution is to use the stringified JSON query instead to include data with
scope specified:

```ts
// Define the inclusion filter and get its encoded format
const inclusionFilter = {
  include: {
    relation: 'users',
    scope: {
      fields: {name: false},
    },
  },
};
const encodedFilter = encodeURIComponent(JSON.stringify(filter));
```

and call `/modelName?filter=<encodedFilter>`

### Examples

- Return all customers with their orders:

{% include code-caption.html content="Node.js API" %}

```ts
await customerRepository.find({include: [{relation: 'orders'}]});
```

{% include code-caption.html content="REST" %}

`/customers?filter[include][][relation]=orders`

Or stringified JSON format:

`/customers?filter={"include":[{"relation":"orders"}]}`

Result:

```ts
[{
    id: 1,
    name: 'Tom Nook',
    orders:[{id: 1, desc: 'pencil'}]
 },
 {...}
]
```

- Return all customers with their orders and their address:

{% include code-caption.html content="Node.js API" %}

```ts
await customerRepository.find({
  include: [{relation: 'orders'}, {relation: 'address'}],
});
```

{% include code-caption.html content="REST" %}

`/customers?filter[include][0][relation]=orders?filter[include][1][relation]=address`

Result:

```ts
[{
    id: 1,
    name: 'Tom Nook',
    orders:[{id: 1, desc: 'pencil'}],
    address: {'8200 Warden Ave'}
 },
 {...}
]
```

- Return all customers with their orders and also the shipment information of
  orders:

{% include code-caption.html content="Node.js API" %}

```ts
await customerRepository.find({
  include: [
    {
      relation: 'orders',
      scope: {
        include: [{relation: 'shipment'}],
      },
    },
  ],
});
```

{% include code-caption.html content="REST" %}

(using `encodeURIComponent`)

```
/customers?filter=%7B"include"%3A%5B%7B"relation"%3A"orders"%2C"scope"%3A%7B"include"%3A%5B%7B"relation"%3A"shipment"%7D%5D%7D%7D%5D%7D
```

Result:

```ts
[{
    id: 1,
    name: 'Tom Nook',
    orders:[
        {id: 123,
        desc: 'pencil',
        shipment: {id: 999, company: 'UPS'} // nested related models
        }
    ],
 },
 {...}
]
```

#### Combined use of `fields` and `include` for a `belongsTo` relation

If you want to use both `include` and [`fields`](Fields-filter.md) to display
only specific fields of a model and a specific belongsTo relation, **you need to
add the relation foreign key in the `fields`** :

Return all posts only with field `title` and the relation `category`:

```ts
await postRepository.find({
  include: [{relation: 'category'}],
  fields: ['title', 'categoryId'],
});
```

#### Include with filters

In some cases, you may want to apply filters to related models to be included.

{% include note.html content="

When you apply filters to related models, the query returns results from the
first model plus any results from related models with the filter query, similar
to a \"left join\" in SQL.

" %}

LoopBack supports that with the following syntax (for example):

```ts
await postRepository.find({
  include: [
    {
      relation: 'owner', // include the owner object
      scope: {
        // further filter the owner object
        fields: ['username', 'email'], // only show two fields
        include: {
          // include orders for the owner
          relation: 'orders',
          scope: {
            where: {orderId: 5}, // only select order with id 5
          },
        },
      },
    },
  ],
});
```

For real-world scenarios where only users in `$authenticated` or `$owner` roles
should have access, use `findById()`. For example, the following example uses
filters to perform pagination:

```ts
await postRepository.findById('123', {
  include: [
    {
      relation: 'owner',
      scope: {
        // fetch 1st "page" with 5 entries in it
        skip: 0,
        limit: 5,
      },
    },
  ],
});
```

#### Access included objects

In the Node.js API, you can simply access the returned model instance with
related items as a plain JSON object. For example:

```ts
const result = await postRepository.find({
  include: [{relation: 'owner'}, {relation: 'orders'}],
});
console.log(result[0].owner, result[0].orders);
// log the related owner and order of the first returned instance
```

Note the relation properties such as `post.owner` reference a JavaScript
**function** for the relation method.

#### REST examples

These examples assume a customer model with a hasMany relationship to a reviews
model.

Return all customers including their reviews:

`/customers?filter[include][][relation]=reviews`

Return all customers including their reviews and also their orders:

`/customers?filter[include][0][relation]=reviews?filter[include][1][relation]=orders`

Return all customers whose age is 21, including their reviews:

`/customers?filter[include][][relation]=reviews&filter[where][age]=21`

Return first two customers including their reviews:

`/customers?filter[include][][relation]=reviews&filter[limit]=2`

**See also**:
[Querying related models](HasMany-relation.md#querying-related-models).
