---
lang: en
title: 'Validation in REST Layer'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Validation-REST-layer.html
---

At the REST layer, request body is being validated against the OpenAPI schema
specification.

## Type Validation

Type validation comes out-of-the-box in LoopBack.

> Validation is applied on the parameters and the request body data. It also
> uses OpenAPI specification as the reference to infer the validation rules.

Take the `capacity` property in the [`CoffeeShop` model](Validation.md) as an
example; it is a number. When creating a `CoffeeShop` by calling `/POST`, if a
string is specified for the `capacity` property as below:

```json
{
  "city": "Toronto",
  "phoneNum": "416-111-1111",
  "capacity": "100"
}
```

a "request body is invalid" error is expected:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "code": "VALIDATION_FAILED",
    "details": [
      {
        "path": ".capacity",
        "code": "type",
        "message": "should be number",
        "info": {
          "type": "number"
        }
      }
    ]
  }
}
```

## Validation against OpenAPI Schema Specification

For validation against an OpenAPI schema specification, the
[AJV module](https://github.com/epoberezkin/ajv) is used to validate data with a
JSON schema generated from the OpenAPI schema specification. More details can be
found about
[validation keywords](https://github.com/epoberezkin/ajv#validation-keywords)
and
[annotation keywords](https://github.com/epoberezkin/ajv#annotation-keywords)
available in AJV. AJV can also be extended with custom keywords and formats, see
[AJV defining custom keywords page](https://ajv.js.org/custom.html).

Besides AJV, other third-party validation libraries, such as
[@hapi/joi](https://github.com/hapijs/joi) and
[class-validator](https://github.com/typestack/class-validator), can be used.

Below are a few examples of using AJV for validation. The source code of the
snippets can be found in the
[coffee-shop.model.ts in the example app](https://github.com/strongloop/loopback-next/blob/master/examples/validation-app/src/models/coffee-shop.model.ts).

{% include note.html content="The `jsonSchema` property expects [JSON Schema Draft-07](http://json-schema.org/draft/2019-09/json-schema-validation.html), which is then transformed into the [OAS 3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) variant." %}

### Example 1: Length limit

A typical validation example is to have a length limit on a string using the
keywords `maxLength` and `minLength`. For example:

{% include code-caption.html content="/src/models/coffee-shop.model.ts" %}

```ts
  @property({
    type: 'string',
    required: true,
    // --- add jsonSchema -----
    jsonSchema: {
      maxLength: 10,
      minLength: 1,
    },
    // ------------------------
  })
  city: string;
```

If the `city` property in the request body does not satisfy the requirement as
follows:

```json
{
  "city": "a long city name 123123123",
  "phoneNum": "416-111-1111",
  "capacity": 10
}
```

an error will occur with details on what has been violated:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "code": "VALIDATION_FAILED",
    "details": [
      {
        "path": ".city",
        "code": "maxLength",
        "message": "should NOT be longer than 10 characters",
        "info": {
          "limit": 10
        }
      }
    ]
  }
}
```

### Example 2: Value range for a number

For numbers, the validation rules are used to specify the range of the value.
For example, any coffee shop would not be able to have more than 100 people, it
can be specified as follows:

{% include code-caption.html content="/src/models/coffee-shop.model.ts" %}

```ts
  @property({
    type: 'number',
    required: true,
    // --- add jsonSchema -----
    jsonSchema: {
      maximum: 100,
      minimum: 1,
    },
    // ------------------------
  })
  capacity: number;
```

### Example 3: Pattern in a string

Model properties, such as phone number and postal/zip code, usually have certain
patterns. In this case, the `pattern` keyword is used to specify the
restrictions.

Below shows an example of the expected pattern of phone numbers, i.e. a sequence
of 10 digits separated by `-` after the 3rd and 6th digits.

{% include code-caption.html content="/src/models/coffee-shop.model.ts" %}

```ts
  @property({
    type: 'string',
    required: true,
    // --- add jsonSchema -----
    jsonSchema: {
      pattern: '\\d{3}-\\d{3}-\\d{4}',
    },
    // ------------------------
  })
  phoneNum: string;
```

{% include tip.html content="RegExp can be converted into a string with `.source` to avoid escaping backslashes" %}
