---
lang: en
title: 'Validation in REST Layer'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Validation-REST-layer.html
---

At the REST layer, there are 2 types of validation:

1. [Type validation](#type-validation)
2. [Validation against OpenAPI schema specification](#validation-against-openapi-schema-specification)

## Type Validation

The type validation in the REST layer comes out of the box in LoopBack.

> Validations are applied on the parameters and the request body data. They also
> use OpenAPI specification as the reference to infer the validation rules.

For instance, the `capacity` property in the `CoffeeShop` model is a number.
When creating a `CoffeeShop` by calling /POST, if you specify the `capacity`
property as a string like below:

```json
{
  "city": "Toronto",
  "phoneNum": "416-111-1111",
  "capacity": "100"
}
```

you'll receive a "request body is invalid" error:

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

You can use the [AJV module](https://github.com/epoberezkin/ajv) to to validate
data with a JSON schema generated from the OpenAPI schema specification.

While you can find out more details on the
[validation keywords](https://github.com/epoberezkin/ajv#validation-keywords)
and
[annotation keywords](https://github.com/epoberezkin/ajv#annotation-keywords)
available in AJV, I'm going to show you a few common examples using AJV for
validation.

### Example#1: Length limit

A typical validation example is to have a length limit on a string. You can use
`maxLength` and `minLength` for this. For example:

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

you'll get an error with details on what has been violated:

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

### Example#2: Value range for a number

For numbers, you can specify the range of the value. Say, any coffee shop would
not be able to have more than 100 people, we can specify the following:

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

### Example#3: Pattern in a string

Model properties, such as phone number and postal/zip code, usually have certain
patterns. In this case, you can use the `pattern` keyword to specify the
restrictions.

Below shows any example of the expected pattern of phone numbers, i.e. a
sequence of 10 digits separated by `-` after the 3rd and 6th digits.

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
