---
lang: en
title: 'Parsing requests'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Parsing-requests.html
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
    return this.todoRepo.replaceById(id, todo);
  }
}
```

An OpenAPI operation specification will be generated in-memory to describe it,
and raw data is parsed from request according to the specification. In the
example above, the first parameter is from source `path`, so its value will be
parsed from a request's path.

{% include note.html title="Controller documentation" content="
See [controllers](Controller.md) for more details of defining an endpoint.
" %}

{% include note.html title="OpenAPI operation object" content="
See [OpenAPI operation object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#operationObject)
to know more about its structure.
" %}

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
  return this.todoRepo.replaceById(id, todo);
}
```

#### Object values

{% include note.html content="
LoopBack has switched the definition of json query params from the `exploded`,
`deep-object` style to the `url-encoded` style definition in Open API spec.
" %}

OpenAPI specification describes several ways how to encode object values into a
string, see
[Style Values](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#style-values)
and
[Style Examples](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#style-examples).

At the moment, LoopBack supports both url-encoded and exploded values for json
query parameters. Please note that this style does not preserve the encoding of
primitive types like numbers and booleans. They are always parsed as strings.

To filter results from the GET `/todo-list` endpoint in the todo-list example
with a relation, { "include": [ { "relation": "todo" } ] }, the following
url-encoded query parameter can be used,

```
   http://localhost:3000/todos?filter=%7B%22include%22%3A%5B%7B%22relation%22%3A%22todoList%22%7D%5D%7D
```

As an extension to the url-encoded style, LoopBack also supports queries with
exploded values for json query parameters.

For example:

```
GET /todos?filter[where][completed]=false
// filter={where: {completed: 'false'}}
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
[API Docs](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.param.html). Check
out the section on [parameter decorators](Decorators.md#parameter-decorator) for
instructions on how to decorate the controller parameter.

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
- object: should be a plain data object, not an array.

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
    return this.todoRepo.replaceById(id, todo);
  }
...
```

The request body specification is defined by applying `@requestBody()` to
argument `todo`, and the schema specification inside it is inferred from its
type `Todo`. The type is exported from a `Todo` model.

{% include note.html title="Model documentation" content="
See [model](Model.md) to know more details about how to decorate a model class.
" %}

When the `PUT` method on the `/todo/{id}` gets called, the `todo` instance from
the request body will be validated with a well defined specification.

Validation of model objects is heavily dependent on its OpenAPI Schema defined
in/by the `@requestBody` decorator. Please refer to the documentation on
[@requestBody decorator](Decorators.md#requestbody-decorator) to get a
comprehensive idea of defining custom validation rules for your models.

You can also specify the JSON schema validation rules in the model property
decorator. The rules are added in a field called `jsonSchema`, like:

```ts
@model()
class Product extends Entity {
  @property({
    name: 'name',
    description: "The product's common name.",
    type: 'string',
    // Specify the JSON validation rules here
    jsonSchema: {
      maxLength: 30,
      minLength: 10,
    },
  })
  public name: string;
}
```

A full list of validation keywords could be found in the
[documentation of AJV validation keywords](https://github.com/epoberezkin/ajv#validation-keywords).

## Common tasks

- [Guide to parsing requests](Parsing-requests-guide.md)
