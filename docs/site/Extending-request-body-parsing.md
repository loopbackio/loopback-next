---
lang: en
title: 'Extending request body parsing'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Extending-request-body-parsing.html
---

## Parsing requests

LoopBack 4 uses the `Content-Type` header and `requestBody` of the OpenAPI spec
to parse the body of http requests. Please see
[Parsing requests](./Parsing-requests.md) for more details.

The `@loopback/rest` module ships a set of built-in body parsers:

- `json`: parses the http request body as a json value (object, array, string,
  number, boolean, null)
- `urlencoded`: decodes the http request body from
  'application/x-www-form-urlencoded'
- `text`: parses the http request body as a `string`
- `stream`: keeps the http request body as a stream without parsing
- `raw`: parses the http request body as a `Buffer`

To support more media types, LoopBack defines extension points to plug in body
parsers to parse the request body. LoopBack's request body parsing capability
can be extended in the following ways:

## Adding a new parser

To add a new body parser, follow the steps below:

1. Define a class that implements the `BodyParser` interface:

```ts
/**
 * Interface to be implemented by body parser extensions
 */
export interface BodyParser {
  /**
   * Name of the parser
   */
  name: string | symbol;
  /**
   * Indicate if the given media type is supported
   * @param mediaType - Media type
   */
  supports(mediaType: string): boolean;
  /**
   * Parse the request body
   * @param request - http request
   */
  parse(request: Request): Promise<RequestBody>;
}
```

A body parser implementation class will be instantiated by the LoopBack runtime
within the context and it can leverage dependency injections. For example:

```ts
export class JsonBodyParser implements BodyParser {
  name = 'json';
  private jsonParser: BodyParserMiddleware;

  constructor(
    @inject(RestBindings.REQUEST_BODY_PARSER_OPTIONS, {optional: true})
    options: RequestBodyParserOptions = {},
  ) {
    const jsonOptions = getParserOptions('json', options);
    this.jsonParser = json(jsonOptions);
  }
  // ...
}
```

See the complete code at
https://github.com/strongloop/loopback-next/blob/master/packages/rest/src/body-parsers/body-parser.json.ts.

2. Bind the body parser class to your REST server/application:

For example,

```ts
server.bodyParser(XmlBodyParser);
```

The `bodyParser` api binds `XmlBodyParser` to the context with:

- key: `request.bodyParser.XmlBodyParser`
- tag: `request.bodyParser`

Please note that newly added body parsers are always invoked before the built-in
ones.

### Contribute a body parser from a component

A component can add one or more body parsers via its bindings property:

```ts
import {createBodyParserBinding} from '@loopback/rest';

export class XmlComponent implements Component {
  bindings = [createBodyParserBinding(XmlBodyParser)];
}
```

### Customize parser options

The request body parser options is bound to
`RestBindings.REQUEST_BODY_PARSER_OPTIONS`. To customize request body parser
options, you can simply bind a new value to its key.

Built-in parsers retrieve their own options from the request body parser
options. The parser specific properties override common ones. For example, given
the following configuration:

```ts
{
  limit: '1MB'
  json: {
    strict: false
  },
  text: {
    limit: '2MB'
  },
  /**
   * Validation options for AJV, see https://github.com/epoberezkin/ajv#options
   * This setting is global for all request body parsers and it cannot be
   * overridden inside parser specific properties such as `json` or `text`.
   */
  validation: {nullable: true},
}
```

The json parser will be created with `{limit: '1MB', strict: false}` and the
text parser with `{limit: '2MB'}`.

Custom parsers can choose to have its own `options` from the context by
dependency injection, for example:

```ts
export class XmlBodyParser implements BodyParser {
  name = 'xml';

  constructor(
    @inject('request.bodyParsers.xml.options', {optional: true})
    options: XmlBodyParserOptions = {},
  ) {
    ...
  }
  // ...
}
```

## Replace an existing parser

An existing parser can be replaced by binding a different value to the
application context.

```ts
class MyJsonBodyParser implements BodyParser {
  // ...
}
app.bodyParser(MyJsonBodyParser, RestBindings.REQUEST_BODY_PARSER_JSON);
```

## Remove an existing parser

An existing parser can be removed from the application by unbinding the
corresponding key. For example, the following code removes the built-in JSON
body parser.

```ts
app.unbind(RestBindings.REQUEST_BODY_PARSER_JSON);
```
