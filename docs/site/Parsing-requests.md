---
lang: en
title: 'Parsing requests'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Parsing-requests.html
summary:
---

## Parsing Requests

This is an action in the default HTTP sequence, it parses arguments from an
incoming request and uses them as inputs to invoke the corresponding controller
method.

This action contains 3 steps:

- Parses arguments from request query, body, path and header according to the
  operation's OpenAPI specification.
- Coerces parameters from string to its corresponding JavaScript run-time type.
- Performs validation on the parameters and body data.

### Parsing Raw Data

The code below defines a typical endpoint by decorating a controller method with
rest decorators.

```ts
class TodoController {
  constructor(@repository(TodoRepository) protected todoRepo: TodoRepository) {}

  @put('/todos/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }
}
```

An OpenAPI operation specification will be generated in-memory to describe it,
and raw data is parsed from request according to the specification. In the
example above, the first parameter is from source `path`, so its value will be
parsed from a request's path.

{% include note.html title="Controller documentation" content="See [controller](Controller.md) for more details of defining an endpoint." %}

{% include note.html title="OpenAPI operation object" content="See
[OpenAPI operation object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#operationObject)
to know more about its structure." %}

### Coercion

The parameters parsed from path, header, and query of a http request are always
in the string format when using the `http` module in Node.js to handle requests.
Therefore when invoking a controller function, a parameter need to be converted
to its corresponding JavaScript runtime type, which is inferred from its
parameter specification.

For example, the operation `replaceTodo` in section
[parsing raw data](#parsing-raw-data) takes in a number `id` as the first input.
Without coercion,`id` would have to be manually cast into the number type before
it can be used as seen below:

```ts
@put('/todos/{id}')
async replaceTodo(
  @param.path.number('id') id: number,
  @requestBody() todo: Todo,
): Promise<boolean> {
  // NO need to do the "string to number" convertion now,
  // coercion automatically handles it for you.
  id = +id;
  return await this.todoRepo.replaceById(id, todo);
}
```

### Validation

Validations are applied on the parameters and the request body data. They also
use OpenAPI specification as the reference to infer the validation rules.

#### Parameters

We have the data type safety check for the parameters parsed from header, path,
and query. For example, if a parameter should be an integer, then a number with
decimal like "1.23" would be rejected.

You can specify a parameter's type by calling shortcut decorators of `@param`
like `@param.query.integer()`. A list of available shortcuts can be found in the
[API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/openapi-v3.html#param).
Check out the section on
[parameter decorators](Decorators.md#parameter-decorator) for instructions on
how to decorate the controller parameter.

Here are our default validation rules for each type:

- number: validated by `isNaN(Number(data))`.
- integer: validated by `Number.isInteger(data)`.
- long: validated by `Number.isSafeInteger(data)`.
- date-time: should be a valid date-time defined in
  [RFC3339](https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14).
- date: should be a valid full-date defined in
  [RFC3339](https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14).
- boolean: after converted to all upper case, should be one of the following
  values: `TRUE`, `1`, `FALSE` or `0`.

#### Request Body

The data from request body is validated against its OpenAPI schema
specification. We use [AJV](https://github.com/epoberezkin/ajv) module to
perform the validation, which validates data with a JSON schema generated from
the OpenAPI schema specification.

Take again the operation replaceTodo for instance:

```ts
import {Todo} from './models';

// class definition
...
  @put('/todos/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }
...
```

The request body specification is defined by applying `@requestBody()` to
argument `todo`, and the schema specification inside it is inferred from its
type `Todo`. The type is exported from a `Todo` model.

{% include note.html title="Model documentation" content="See [model](Model.md) to know more details about how to decorate a model class" %}

When the `PUT` method on the `/todo/{id}` gets called, the `todo` instance from
the request body will be validated with a well defined specification.

Validation of model objects is heavily dependent on its OpenAPI Schema defined
in/by the `@requestBody` decorator. Please refer to the documentation on
[@requestBody decorator](Decorators.md#requestbody-decorator) to get a
comprehensive idea of defining custom validation rules for your models.

A few tips worth mentioning:

- If a model property's type refers to another model, make sure it is also
  decorated with `@model` decorator.

- If you're using API first development approach, you can also provide the
  request body specification in decorators like `route()` and
  [`api()`](Decorators.md#api-decorator), this requires you to provide a
  completed request body specification.

#### Localizing Errors

A body data may break multiple validation rules, like missing required fields,
data in a wrong type, data that exceeds the maximum length, etc...The validation
errors are returned in batch mode, and user can find all of them in
`error.details`, which describes errors in a machine-readable way.

Each element in the `error.details` array reports one error. It contains 4
attributes:

- `path`: The path to the invalid field.
- `code`: A single word code represents the error's type.
- `message`: A human readable description of the error.
- `info`: Some additional details that the 3 attributes above don't cover.

In most cases `path` shows which field in the body data is invalid. For example,
if an object schema's `id` field should be a string, while the data in body has
it as a number: `{id: 1, name: 'Foo'}`. Then the error entry is:

```ts
{
  path: '.id',
  code: 'type',
  message: 'should be string',
  info: {type: 'string'},
}
```

And in this case the error code is `type`. A reference of all the possible code
could be found in
[ajv validation error keywords(codes)](https://github.com/epoberezkin/ajv/blob/master/KEYWORDS.md).

In some exception scenarios, like a required field is missing, the `path` is
empty, but the field location is easy to find in `message` and `info`. For
example, `id` is a required field while it's missing in a request body:
`{name: 'Foo'}`, the error entry will be:

```ts
{
  // `path` is empty
  path: '',
  code: 'required',
  message: "should have required property 'id'",
  // you can parse the missing field from `info.missingProperty`
  info: {missingProperty: 'id'},
},
```
