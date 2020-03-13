---
lang: en
title: 'OpenAPI Decorators'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_openapi.html
---

## Route Decorators

Route decorators are used to expose controller methods as REST API operations.
If you are not familiar with the concept of Route or Controller, please see
[LoopBack Route](Routes.md) and [LoopBack Controller](Controllers.md) to learn
more about them.

By calling a route decorator, you provide OpenAPI specification to describe the
endpoint which the decorated method maps to. You can choose different decorators
accordingly or do a composition of them:

### API Decorator

Syntax:
[`@api(spec: ControllerSpec)`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.api.html)

`@api` is a decorator for the controller class and is appended just before it's
declared. `@api` is used when you have multiple
[Paths Objects](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathsObject)
that contain all path definitions of your controller. Please note the api specs
defined with `@api` will override other api specs defined inside the controller.
For example:

```ts
@api({
  basePath: '/',
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet',
        'x-controller-name': 'MyController',
        parameters: [{name: 'name', schema: {type: 'string'}, in: 'query'}],
        responses: {
          '200': {
            description: 'greeting text',
            content: {
              'application/json': {
                schema: {type: 'string'},
              },
            },
          },
        },
      },
    },
  },
})
class MyController {
  // The operation endpoint defined here will be overriden!
  @get('/greet')
  greet(@param.query.number('limit') name: string) {}
}
app.controller(MyController);
```

A more detailed explanation can be found in
[Specifying Controller APIs](Controllers.md#specifying-controller-apis)

### Operation Decorator

Syntax:
[`@operation(verb: string, path: string, spec?: OperationObject)`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.operation.html)

`@operation` is a controller method decorator. It exposes a Controller method as
a REST API operation and is represented in the OpenAPI spec as an
[Operation Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operation-object).
You can specify the verb, path, parameters, and response as a specification of
your endpoint, for example:

```ts
const spec = {
  parameters: [{name: 'name', schema: {type: 'string'}, in: 'query'}],
  responses: {
    '200': {
      description: 'greeting text',
      content: {
        'application/json': {
          schema: {type: 'boolean'},
        },
      },
    },
  },
};
class MyController {
  @operation('HEAD', '/checkExist', spec)
  checkExist(name: string) {}
}
```

### Commonly-used Operation Decorators

Syntax:
[`@get(path: string, spec?: OperationObject)`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.get.html)

Same Syntax for decorators
[`@post`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.post.html) ,
[`@put`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.put.html) ,
[`@patch`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.patch.html) ,
[`@del`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.del.html)

You can call these sugar operation decorators as a shortcut of `@operation`. For
example:

```ts
class MyController {
  @get('/greet', spec)
  greet(name: string) {}
}
```

is equivalent to

```ts
class MyController {
  @operation('GET', '/greet', spec)
  greet(name: string) {}
}
```

### Parameter Decorator

Syntax: see
[API documentation](https://github.com/strongloop/loopback-next/tree/master/packages/openapi-v3/src/decorators/parameter.decorator.ts#L17-L29)

`@param` is applied to controller method parameters to generate an OpenAPI
parameter specification for them.

For example:

```ts
import {get, param} from '@loopback/rest';

const categorySpec = {
  name: 'category',
  in: 'path',
  required: true,
  schema: {type: 'string'},
};

const pageSizeSpec = {
  name: 'pageSize',
  in: 'query',
  required: false,
  schema: {type: 'integer', format: 'int32'},
};

class MyController {
  @get('Pets/{category}')
  list(
    @param(categorySpec) category: string,
    @param(pageSizeSpec) pageSize?: number,
  ) {}
}
```

Writing the whole parameter specification is tedious, so we've created shortcuts
to define the params with the pattern `@param.${in}.${type}(${name})`:

- in: The parameter location. It can be one of the following values: `query`,
  `header`, or `path`.
- type: A
  [common name of OpenAPI primitive data type](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#data-types).
- name: Name of the parameter. It should be a `string`.

A list of available shortcuts for `query` can be found in
[API document](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.param.query.html),
along with the shortcuts for `path` and `header`.

An equivalent example using the shortcut decorator would be:

```ts
class MyController {
  @get('/Pets/{category}')
  list(
    @param.path.string('category') category: string,
    @param.query.number('pageSizes') pageSize?: number,
  ) {}
}
```

You can find specific use cases in
[Writing Controller methods](Controllers.md#writing-controller-methods)

_The parameter location cookie is not supported yet, see_
_(https://github.com/strongloop/loopback-next/issues/997)_

### Parameter Decorator to support json objects

{% include note.html content="
LoopBack has switched the definition of json query params from the `exploded`,
`deep-object` style to the `url-encoded` style definition in Open API spec.
" %}

The parameter decorator `@param.query.object` is applied to generate an Open API
definition for query parameters with JSON values. The generated definition
currently follows the `url-encoded` style as shown below.

```json
{
  "in": "query",
  "content": {
    "application/json": {
      "schema": {}
    }
  }
}
```

The above style where the schema is `wrapped` under content['application/json']
supports receiving `url-encoded` payload for a json query parameter as per Open
API specification.

To filter results from the GET '/todo-list' endpoint in the todo-list example
with a specific relation, { "include": [ { "relation": "todo" } ] }, the
following `url-encoded` query parameter can be used,

```
   http://localhost:3000/todos?filter=%7B%22include%22%3A%5B%7B%22relation%22%3A%22todoList%22%7D%5D%7D
```

As an extension to the url-encoded style, LoopBack also supports queries with
exploded values for json query parameters.

```
GET /todos?filter[where][completed]=false
// filter={where: {completed: 'false'}}
```

### RequestBody Decorator

Syntax: see
[API documentation](https://github.com/strongloop/loopback-next/tree/master/packages/openapi-v3/src/decorators/request-body.decorator.ts#L20-L79)

`@requestBody()` is applied to a controller method parameter to generate OpenAPI
requestBody specification for it.

_Only one parameter can be decorated by `@requestBody` per controller method._

A typical
[OpenAPI requestBody specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject)
contains properties `description`, `required`, and `content`:

```ts
requestBodySpec: {
  description: 'a user',
  required: true,
  content: {
    'application/json': {...schemaSpec},
    'application/text': {...schemaSpec},
  },
}
```

In order to use `@requestBody` in a parameter type, the model in the parameter
type must be decorated with `@model` and `@property`:

```ts
import {model, property} from '@loopback/repository';
import {Address} from './address.model';

@model()
class User {
  @property()
  firstname: string;
  @property()
  lastname: string;
  @property()
  address: Address;
}
```

_To learn more about decorating models and the corresponding OpenAPI schema, see
[model decorators](Model.md#model-decorator)._

The model decorators allow type information of the model to be visible to the
spec generator so that `@requestBody` can be used on the parameter:

{% include code-caption.html content="/src/controllers/user.controller.ts" %}

```ts
import {User} from '../models/user.model';
import {put} from '@loopback/rest';

class UserController {
  @put('/Users/{id}')
  async replaceUser(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ) {}
}
```

For the simplest use case, you can leave the input of `@requestBody` empty since
we automatically detect the type of `user` and generate the corresponding schema
for it. The default content type is set to be `application/json`.

You can also customize the generated `requestBody` specification in three ways:

- Add the optional fields `description` and `required`

```ts
class MyController {
  @put('/Users/{id}')
  async replaceUser(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'a modified user',
      required: true,
    })
    user: User,
  ) {}
}
```

- Override the content type or define multiple content types

```ts
class MyController {
  @put('/Users/{id}')
  async replaceUser(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        // leave the schema as empty object, the decorator will generate it for both.
        'application/text': {},
        'application/xml': {},
      },
    })
    user: User,
  ) {}
}
```

- Override the schema specification

```ts
import {UserSchema, User} from '../model/user.schema';

class MyController {
  @put('/Users/{id}')
  async replaceUser(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': UserSchema,
      },
    })
    user: User,
  ) {}
}
```

#### @requestBody.file

`@requestBody.file` marks a request body for `multipart/form-data` based file
upload. For example,

```ts
import {post, requestBody} from '@loopback/openapi-v3';
import {Request} from '@loopback/rest';
class MyController {
  @post('/pictures')
  upload(
    @requestBody.file()
    request: Request,
  ) {
    // ...
  }
}
```

_We plan to support more `@requestBody` shortcuts in the future. You can track
the feature in
[story 1064](https://github.com/strongloop/loopback-next/issues/1064)._

### x-ts-type extension

To simplify schema definition and reference, LoopBack allows `x-ts-type`
extension for the OpenAPI schema object. The `x-ts-type` points to a model class
or simple types. It can be used for parameters, request body and responses. For
example,

```ts
import {model, property} from '@loopback/repository';
import {requestBody, post, get} from '@loopback/openapi-v3';

@model()
class MyModel {
  @property()
  name: string;
}

export class MyController {
  @get('/', {
    responses: {
      '200': {
        description: 'hello world',
        content: {'application/json': {schema: {'x-ts-type': MyModel}}},
      },
    },
  })
  hello() {
    return 'hello world';
  }

  @post('/')
  greet(
    @requestBody({
      content: {'application/json': {schema: {'x-ts-type': MyModel}}},
    })
    body: MyModel,
  ) {
    return `hello ${body.name}`;
  }
}
```

The `x-ts-type` can be used for array and object properties too:

```ts
const schemaWithArrayOfMyModel = {
  type: 'array',
  items: {
    'x-ts-type': MyModel,
  },
};

const schemaDeepArrayOfMyModel = {
  type: 'array',
  items: {
    type: 'array',
    items: {
      'x-ts-type': MyModel,
    },
  },
};

const schemaWithObjectPropOfMyModel = {
  type: 'object',
  properties: {
    myModel: {
      'x-ts-type': MyModel,
    },
  },
};

export class SomeController {
  @post('/my-controller')
  greetObjectProperty(
    @requestBody({
      content: {'application/json': {schema: schemaWithObjectPropOfMyModel}},
    })
    body: {
      myModel: MyModel;
    },
  ): string {
    return `hello ${body.myModel.name}!`;
  }

  @get('/my-controllers', {
    responses: {
      '200': {
        description: 'hello world',
        content: {'application/json': {schema: schemaWithArrayOfMyModel}},
      },
    },
  })
  everyone(): MyModel[] {
    return [{name: 'blue'}, {name: 'red'}];
  }

  @post('/my-controllers')
  greetEveryone(
    @requestBody({
      content: {'application/json': {schema: schemaDeepArrayOfMyModel}},
    })
    body: MyModel[][],
  ): string {
    return `hello ${body.map(objs => objs.map(m => m.name))}`;
  }
}
```

#### anyOf, allOf, oneOf, not

The `x-ts-type` extention is also valid as a value in `allOf`, `anyOf`, `oneOf`,
and `not` schema keys.

```ts
@model
class FooModel extends Model {
  @property()
  foo: string;
}

@model
class BarModel extends Model {
  @property()
  bar: string;
}

@model
class BazModel extends Model {
  @property()
  baz: string;
}

class MyController {
  @get('/some-value', {
    responses: {
      '200': {
        description: 'returns a union of two values',
        content: {
          'application/json': {
            schema: {
              not: {'x-ts-type': BazModel},
              allOf: [{'x-ts-type': FooModel}, {'x-ts-type': BarModel}],
            },
          },
        },
      },
    },
  })
  getSomeValue() {
    return {foo: 'foo', bar: 'bar'};
  }
}
```

When the OpenAPI spec is generated, the `xs-ts-type` is mapped to
`{$ref: '#/components/schemas/MyModel'}` and a corresponding schema is added to
`components.schemas.MyModel` of the spec.

## Convenience Decorators

While you can supply a fully valid OpenAPI specification for the class-level
`@api` decorator, and full operation OpenAPI specification for `@operation` and
the other convenience decorators, there are also a number of utility decorators
that allow you to supply specific OpenAPI information without requiring you to
use verbose JSON.

## Shortcuts for the OpenAPI Spec (OAS) Objects

All of the above are direct exports of `@loopback/openapi-v3`, but they are also
available under the `oas` namespace:

```ts
import {oas} from '@loopback/openapi-v3';

@oas.api({})
class MyController {
  @oas.get('/greet/{id}')
  public greet(@oas.param('id') id: string) {}
}
```

This namespace contains decorators that are specific to the OpenAPI
specification, but are also similar to other well-known decorators available,
such as `@deprecated()`

### @oas.deprecated

[API document](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.deprecated.html),
[OpenAPI Operation Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operation-object)

This decorator can currently be applied to class and a class method. It will set
the `deprecated` boolean property of the Operation Object. When applied to a
class, it will mark all operation methods of that class as deprecated, unless a
method overloads with `@oas.deprecated(false)`.

This decorator does not currently support marking
(parameters)[https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameter-object]
as deprecated.

```ts
@oas.deprecated()
class MyController {
   @oas.get('/greet')
   public async function greet() {
    return 'Hello, World!'
  }

  @oas.get('/greet-v2')
  @oas.deprecated(false)
  public async function greetV2() {
    return 'Hello, World!'
  }
}

class MyOtherController {
  @oas.get('/echo')
  @oas.deprecated()
  public async function echo() {
    return 'Echo!'
  }
}
```

### @oas.response

[API document](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.oas.response.html),
[OpenAPI Response Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#response-object)

This decorator lets you easily add response specifications using `Models` from
`@loopback/repository`. The convenience decorator sets the `content-type` to
`application/json`, and the response description to the string value in the
`http-status` module. The models become references through the `x-ts-type`
schema extention.

```ts
@model()
class SuccessModel extends Model {
  constructor(err: Partial<SuccessModel>) {
    super(err);
  }
  @property({default: 'Hi there!'})
  message: string;
}

class GenericError extends Model {
  @property()
  message: string;
}

class MyController {
  @oas.get('/greet')
  @oas.response(200, SuccessModel)
  @oas.response(500, GenericError)
  greet() {
    return new SuccessModel({message: 'Hello, world!'});
  }
}
```

```json
{
  "paths": {
    "/greet": {
      "get": {
        "responses": {
          "200": {
            "description": "Ok",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SuccessModel"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/GenericError"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Using many models

For a given response code, it's possible to have a path that could return one of
many errors. The `@oas.response` decorator lets you pass multiple Models as
arguments. They're combined using an `anyOf` keyword.

```ts
class FooNotFound extends Model {
  @property()
  message: string;
}

class BarNotFound extends Model {
  @property()
  message: string;
}

class BazNotFound extends Model {
  @property()
  message: string;
}

class MyController {
  @oas.get('/greet/{foo}/{bar}')
  @oas.response(404, FooNotFound, BarNotFound)
  @oas.response(404, BazNotFound)
  greet() {
    return new SuccessModel({message: 'Hello, world!'});
  }
}
```

```json
{
  "paths": {
    "/greet": {
      "get": {
        "responses": {
          "404": {
            "description": "Not Found",
            "content": {
              "application/json": {
                "schema": {
                  "anyOf": [
                    {"$ref": "#/components/schemas/FooNotFound"},
                    {"$ref": "#/components/schemas/BarNotFound"},
                    {"$ref": "#/components/schemas/BazNotFound"}
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Using ReferenceObject, ResponseObjects, ContentObjects

You don't have to use loopback `Models` to use this convenience decorator. Valid
`ReferenceObjects`, `ContentObjects`, and `ResponseObjects` are also valid.

```ts
class MyController {
  // this is a valid SchemaObject
  @oas.get('/schema-object')
  @oas.response(200, {
    type: 'object',
    properties: {
      message: 'string',
    },
    required: 'string',
  })
  returnFromSchemaObject() {
    return {message: 'Hello, world!'};
  }

  // this is a valid ResponseObject
  @oas.get('/response-object')
  @oas.response(200, {
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'base64',
        },
      },
    },
  })
  returnFromResponseObject() {
    return {message: 'Hello, world!'};
  }

  // this is a valid ResponseObject
  @oas.get('/reference-object')
  @oas.response(200, {$ref: '#/path/to/schema'})
  returnFromResponseObject() {
    return {message: 'Hello, world!'};
  }
}
```

#### Using @oas.response.file

`@oas.response.file` is a shortcut decorator to describe response object for
file download. For example:

```ts
import {oas, get, param} from '@loopback/openapi-v3';
import {RestBindings, Response} from '@loopback/rest';

class MyController {
  @get('/files/{filename}')
  @oas.response.file('image/jpeg', 'image/png')
  download(
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    // use response.download(...);
  }
}
```

#### Using more options

The `@oas.response` convenience decorator makes some assumptions for you in
order to provide a level of convenience. The `@operation` decorator and the
method convenience decorators let you write a full, complete, and completely
valid `OperationObject`.

### @oas.tags

[API document](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.tags.html),
[OpenAPI Operation Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operation-object)

This decorator can be applied to a controller class and to controller class
methods. It will set the `tags` array string property of the Operation Object.
When applied to a class, it will mark all operation methods of that class with
those tags. Usage on both the class and method will combine the tags.

```ts
@oas.tags('Foo', 'Bar')
class MyController {
  @oas.get('/greet')
  public async greet() {
    // tags will be [Foo, Bar]
  }

  @oas.tags('Baz')
  @oas.get('/echo')
  public async echo() {
    // tags will be [Foo, Bar, Baz]
  }
}
```

This decorator does not affect the top-level `tags` section defined in the
[OpenAPI Tag Object specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#tag-object).
This decorator only affects the spec partial generated at the class level. You
may find that your final tags also include a tag for the controller name.

## Shortcuts for Filter and Where params

CRUD APIs often expose REST endpoints that take `filter` and `where` query
parameters. For example:

```ts
class TodoController {
  async find(
    @param.query.object('filter', getFilterSchemaFor(Todo))
    filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todoRepository.find(filter);
  }

  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Todo))
    filter?: Filter<Todo>,
  ): Promise<Todo> {
    return this.todoRepository.findById(id, filter);
  }

  async count(
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoRepository.count(where);
  }
}
```

To simplify the parameter decoration for `filter` and `where`, we introduce two
sugar decorators:

- `@param.filter`: For a `filter` query parameter
- `@param.where`: For a `where` query parameter

Now the code from above can be refined as follows:

```ts
class TodoController {
  async find(
    @param.filter(Todo)
    filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todoRepository.find(filter);
  }

  async findById(
    @param.path.number('id') id: number,
    @param.filter(Todo, {exclude: 'where'}) filter?: FilterExcludingWhere<Todo>,
  ): Promise<Todo> {
    return this.todoRepository.findById(id, filter);
  }

  async count(@param.where(Todo) where?: Where<Todo>): Promise<Count> {
    return this.todoRepository.count(where);
  }
}
```
