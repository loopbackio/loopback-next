---
lang: en
title: 'Parsing requests'
keywords: LoopBack 4.0, LoopBack 4
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
See [controllers](Controllers.md) for more details of defining an endpoint.
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

OpenAPI specification describes several ways how to encode object values into a
string, see
[Style Values](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#style-values)
and
[Style Examples](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#style-examples).

At the moment, LoopBack supports object values for parameters in query strings
with `style: "deepObject"` only. Please note that this style does not preserve
encoding of primitive types, numbers and booleans are always parsed as strings.

For example:

```
GET /todos?filter[where][completed]=false
// filter={where: {completed: 'false'}}
```

As an extension to the deep-object encoding described by OpenAPI, when the
parameter is specified with `style: "deepObject"`, we allow clients to provide
the object value as a JSON-encoded string too.

For example:

```
GET /todos?filter={"where":{"completed":false}}
// filter={where: {completed: false}}
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

One request body specification could contain multiple content types. Our
supported content types are `json`, `urlencoded`, and `text`. The client should
set `Content-Type` http header to `application/json`,
`application/x-www-form-urlencoded`, or `text/plain`. Its value is matched
against the list of media types defined in the `requestBody.content` object of
the OpenAPI operation spec. If no matching media types is found or the type is
not supported yet, an `UnsupportedMediaTypeError` (http statusCode 415) will be
reported.

Please note that `urlencoded` media type does not support data typing. For
example, `key=3` is parsed as `{key: '3'}`. The raw result is then coerced by
AJV based on the matching content schema. The coercion rules are described in
[AJV type coercion rules](https://github.com/epoberezkin/ajv/blob/master/COERCION.md).

The [qs](https://github.com/ljharb/qs) is used to parse complex strings. For
example, given the following request body definition:

```ts
const requestBodyObject = {
  description: 'data',
  content: {
    'application/x-www-form-urlencoded': {
      schema: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          location: {
            type: 'object',
            properties: {
              lat: {type: 'number'},
              lng: {type: 'number'},
            },
          },
          tags: {
            type: 'array',
            items: {type: 'string'},
          },
        },
      },
    },
  },
};
```

The encoded value
`'name=IBM%20HQ&location[lat]=0.741895&location[lng]=-73.989308&tags[0]=IT&tags[1]=NY'`
is parsed and coerced as:

```ts
{
  name: 'IBM HQ',
  location: {lat: 0.741895, lng: -73.989308},
  tags: ['IT', 'NY'],
}
```

The request body parser options (such as `limit`) can now be configured by
binding the value to `RestBindings.REQUEST_BODY_PARSER_OPTIONS`
('rest.requestBodyParserOptions'). For example,

```ts
server.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
  limit: '4MB',
});
```

The options can be media type specific, for example:

```ts
server.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
  json: {limit: '4MB'},
  text: {limit: '1MB'},
});
```

The list of options can be found in the
[body-parser](https://github.com/expressjs/body-parser/#options) module.

By default, the `limit` is `1MB`. Any request with a body length exceeding the
limit will be rejected with http status code 413 (request entity too large).

A few tips worth mentioning:

- If a model property's type refers to another model, make sure it is also
  decorated with `@model` decorator.

- If you're using API first development approach, you can also provide the
  request body specification in decorators like `route()` and
  [`api()`](Decorators.md#api-decorator), this requires you to provide a
  completed request body specification.

#### Extend Request Body Parsing

See [Extending request body parsing](./Extending-request-body-parsing.md) for
more details.

#### Specify Custom Parser by Controller Methods

In some cases, a controller method wants to handle request body parsing by
itself, such as, to accept `multipart/form-data` for file uploads or stream-line
a large json document. To bypass body parsing, the `'x-parser'` extension can be
set to `'stream'` for a media type of the request body content. For example,

```ts
class FileUploadController {
  async upload(
    @requestBody({
      description: 'multipart/form-data value.',
      required: true,
      content: {
        'multipart/form-data': {
          // Skip body parsing
          'x-parser': 'stream',
          schema: {type: 'object'},
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    const storage = multer.memoryStorage();
    const upload = multer({storage});
    return new Promise<object>((resolve, reject) => {
      upload.any()(request, response, err => {
        if (err) reject(err);
        else {
          resolve({
            files: request.files,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fields: (request as any).fields,
          });
        }
      });
    });
  }
}
```

The `x-parser` value can be one of the following:

1. Name of the parser, such as `json`, `raw`, or `stream`

- `stream`: keeps the http request body as a stream without parsing
- `raw`: parses the http request body as a `Buffer`

```ts
{
  'x-parser': 'stream'
}
```

2. A body parser class

```ts
{
  'x-parser': JsonBodyParser
}
```

3. A body parser function, for example:

```ts
function parseJson(request: Request): Promise<RequestBody> {
  return new JsonBodyParser().parse(request);
}

{
  'x-parser': parseJson
}
```

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
