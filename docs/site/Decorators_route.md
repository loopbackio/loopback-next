---
lang: en
title: 'Route Decorators'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_route.html
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
[`@api(spec: ControllerSpec)`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#api)

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
[`@operation(verb: string, path: string, spec?: OperationObject)`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#operation)

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
[`@get(path: string, spec?: OperationObject)`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#get)

Same Syntax for decorators
[`@post`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#post) ,
[`@put`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#put) ,
[`@patch`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#patch) ,
[`@del`](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#del)

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
[API document](http://apidocs.loopback.io/@loopback%2fdocs/openapi-v3.html#param.query),
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
[model decorators](#model-decorators)._

The model decorators allow type information of the model to be visible to the
spec generator so that `@requestBody` can be used on the parameter:

```ts
// in file '/src/controllers/user.controller.ts'
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

_We plan to support more `@requestBody` shortcuts in the future. You can track
the feature in story_
_(https://github.com/strongloop/loopback-next/issues/1064)_
