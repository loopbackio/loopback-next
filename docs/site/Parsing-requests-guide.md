---
lang: en
title: 'Guide to Parsing requests'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Parsing-requests-guide.html
---

## Custom Error Messages

You can also specify custom error messages for JSON schema validation rules, as
explained in
[Custom Validation Rules and Error Messages](Model.md#custom-validation-rules-and-error-messages).

A full list of options & usage scenarios could be found in the
[documentation of AJV errors](https://github.com/epoberezkin/ajv-errors).

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

## Extend Request Body Parsing

See [Extending request body parsing](./Extending-request-body-parsing.md) for
more details.

## Specify Custom Parser by Controller Methods

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

## Localizing Errors

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
  path: '/id',
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
