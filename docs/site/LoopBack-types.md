---
lang: en
title: 'LoopBack Types'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, Type
sidebar: lb4_sidebar
permalink: /doc/en/lb4/LoopBack-types.html
---

## Overview

When defining a model in LoopBack 4, property types are the important part. No
matter whether it is for defining properties with decorator `@property` or
defining a model at runtime, you may want to specify the types in the
definition. The following is a typical property definition:

**Defining a property with the decorator**

```ts
@property({
  type: 'string',
  require: true,
  // other fields
})
userName: String;
```

**Defining a model at runtime**

```ts
const UserDef = new ModelDefinition('User')
  .addProperty('id', {type: 'number', id: true})
  .addProperty('userName', {type: 'string'});
```

The following table summarizes LoopBack types.

<table>
  <tbody>
    <tr>
      <th>Type</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
    <tr>
      <td>any</td>
      <td>Any type, including array, object, Date, or GeoPoint</td>
      <td>Any of: <code>true</code>, <code>123</code>, <code>"foo"</code>, <code>[ "one", 2, true ]</code></td>
    </tr>
    <tr>
      <td>array</td>
      <td>
        <p>JSON array</p>
        <p>See <a href="LoopBack-types.html#array-types">Array types</a> below.</p>
      </td>
      <td><code>[ "one", 2, true ]</code></td>
    </tr>
    <tr>
      <td>Boolean</td>
      <td>JSON Boolean</td>
      <td><code>true</code></td>
    </tr>
    <tr>
      <td>buffer</td>
      <td>Node.js <a href="http://nodejs.org/api/buffer.html" class="external-link" rel="nofollow">Buffer object</a></td>
      <td>
        <pre>new Buffer(42);</pre>
      </td>
    </tr>
    <tr>
      <td>date</td>
      <td>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date" class="external-link" rel="nofollow">Date object</a></td>
      <td>
        <p><code>new Date("December 17, 2003 03:24:00");</code></p>
      </td>
    </tr>
    <tr>
      <td>GeoPoint</td>
      <td>
        <p>LoopBack <a href="http://apidocs.loopback.io/loopback-datasource-juggler/#geopoint" class="external-link" rel="nofollow">GeoPoint</a> object</p>
      </td>
      <td>
        <pre>new GeoPoint({lat: 10.32424, lng: 5.84978});</pre>
      </td>
    </tr>
    <tr>
      <td>Date</td>
      <td>
        <p>LoopBack<a href="http://apidocs.loopback.io/loopback-datasource-juggler/#datestring" class="external-link" rel="nofollow"> DateString</a> object</p>
      </td>
      <td>
        <p><code>"2000-01-01T00:00:00.000Z"</code></p>
        <p><code>"2000-01-01"</code></p>
        <p><code>"2000-01-01 12:00:00"</code></p>
      </td>
    </tr>
    <tr>
      <td>null</td>
      <td>JSON null</td>
      <td><code>null</code></td>
    </tr>
    <tr>
      <td>number</td>
      <td>JSON number</td>
      <td>
        <p><code>3.1415</code></p>
      </td>
    </tr>
    <tr>
      <td>Object</td>
      <td>
        <p>JSON object or any type</p>
        <p>See <a href="LoopBack-types.html#object-types">Object types</a> below.</p>
      </td>
      <td>
        <pre class="de1">{ "userName": "John89", "age": 25, "vip": false}</pre>
      </td>
    </tr>
    <tr>
      <td>String</td>
      <td>JSON string</td>
      <td><code>"LoopBack"</code></td>
    </tr>
  </tbody>
</table>

In general, a property will have `undefined` value if no explicit or default
value is provided.

{% include tip.html content="
 The type name is case-insensitive; so for example you can use either \"Number\" or \"number\".
" %}

{% include note.html content="`GeoPoint` is not supported. See GitHub issue
[#1981](https://github.com/strongloop/loopback-next/issues/1981)" %}

## Array types

The following are examples of how you can define array type properties:

```ts
  @property({
    type: 'array',
    itemType: 'string',
    length: 20,
  })
  strAry?: string[]; // e.g ['can', 'only', 'contain', 'strings']

  @property({
    type: 'array',
    itemType: 'number',
  })
  numAry?: number[]; // e.g ['42', '998', '1']

  @property({
    type: 'array',
    itemType: 'any',
  })
  anyAry?: any[]; // e.g ['LoopBack', 4, true]

  @property({
    type: 'array',
    itemType: 'object',
  })
  ObjAry?: object[]; // e.g [{'Nodejs': 'LoopBack'}]
```

## Object types

Use the Object type when you need to be able to accept values of different
types, for example a string or an array.

A model often has properties that consist of other properties. For example, the
user model can have an `address` property that is in type `Address`, which has
properties `street`, `city`, `state`, and `zipCode`:

```ts
@model()
export class Address extends Entity {
  @property({
    type: 'number',
  })
  id: number;

  // street, city, state, zipCode proper definitions ..
}

@model()
export class User extends Entity {
  // other props

  @property({
    type: 'object',
  })
  address: Address;
}
```

The value of the address is the definition of the `Address` type.

{% include important.html content="
The `User` model has to reference the `Address` model." %}
