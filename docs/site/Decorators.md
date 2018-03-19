---
lang: en
title: 'Decorators'
keywords: LoopBack 4.0, LoopBack-Next
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators.html
summary:
---

A decorator allows you to annotate or modify your class declarations and members
with metadata.

## Introduction

_If you're new to Decorators in TypeScript, see
[here](https://www.typescriptlang.org/docs/handbook/decorators.html) for more
info._

Decorators give LoopBack the flexibility to modify your plain TypeScript classes
and properties in a way that allows the framework to better understand how to
make use of them, without the need to inherit base classes or add functions that
tie into an API.

As a default, LoopBack comes with some pre-defined decorators:

- [Route Decorators](#route-decorators)
- [Dependency Injection](#dependency-injection)
- [Authentication Decorator](#authentication-decorators)
- [Repository Decorators](#repository-decorators)

## Route Decorators

Route decorators are used to expose controller methods as REST API operations.
If you are not familiar with the concept Route or Controller, please see
[LoopBack Route](routes.md) and [LoopBack Controller](controllers.md) to learn
more about them.

By calling a route decorator, you provide OpenAPI specification to describe the
endpoint which the decorated method maps to. You can choose different decorators
accordingly or do a composition of them:

### API Decorator

Syntax:
[`@api(spec: ControllerSpec)`](http://apidocs.loopback.io/@loopback%2fcore/#783)

`@api` is a decorator for controller constructor, it's called before a
controller class. `@api` is used when you have a base path and a Paths Object,
which contains all path definitions of your controller. Please note the api
specs defined with `@api` will override other api specs defined inside the
controller. For example:

```ts
@api({
  basePath: '/',
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet',
        'x-controller-name': 'MyController',
        parameters: [{name: 'name', type: 'string', in: 'query'}],
        responses: {
          '200': {
            description: 'greeting text',
            schema: {type: 'string'},
          },
        },
      },
    },
  },
})
class MyController {
  // The operation endpoint defined here will be overriden!
  @get('/foo')
  @param.query.number('limit')
  greet(name) {}
}
app.controller(MyController);
```

A more detailed explanation can be found in
[Specifying Controller APIs](controllers.htm#specifying-controller-apis)

### Operation Decorator

Syntax:
[`@operation(verb: string, path: string, spec?: OperationObject)`](http://apidocs.loopback.io/@loopback%2fcore/#818)

`@operation` is a controller method decorator. It exposes a Controller method as
a REST API operation. You can specify the verb, path, parameters and response as
specification of your endpoint, for example:

```ts
const spec = {
  parameters: [{name: 'name', type: 'string', in: 'query'}],
  responses: {
    '200': {
      description: 'greeting text',
      schema: {type: 'boolean'},
    },
  },
};
class MyController {
  @operation('HEAD', '/checkExist', spec)
  checkExist(name) {}
}
```

### Commonly-used Operation Decorators

Syntax:
[`@get(path: string, spec?: OperationObject)`](http://apidocs.loopback.io/@loopback%2fcore/#798)

Same Syntax for decorators
[`@post`](http://apidocs.loopback.io/@loopback%2fcore/#802) ,
[`@put`](http://apidocs.loopback.io/@loopback%2fcore/#806) ,
[`@patch`](http://apidocs.loopback.io/@loopback%2fcore/#810) ,
[`@del`](http://apidocs.loopback.io/@loopback%2fcore/#814)

You can call these sugar operation decorators as a shortcut of `@operation`, for
example:

```ts
class MyController {
  @get('/greet', spec)
  greet(name) {}
}
```

is equivalent to

```ts
class MyController {
  @operation('GET', '/greet', spec)
  greet(name) {}
}
```

For more usage, refer to
[Routing to Controllers](controllers.htm#routing-to-controllers)

### Parameter Decorator
 
  Syntax: see [API documentation](https://github.com/strongloop/loopback-next/blob/0739ffcfe3ef50e0bfd86055c0f4e29fd6925be0/packages/openapi-v3/src/parameter-decorator.ts#L17-L29)

  `@param` is applied to controller method parameters to generate OpenAPI parameter specification for them.

  For example:

  ```ts
  import {get, param} from '@loopback/rest';

  const categorySpec = {
    name: 'category',
    in: 'path',
    required: true,
    schema: {type: 'string'}
  }

  const pageSizeSpec = {
    name: 'pageSize',
    in: 'query',
    required: false,
    schema: {type: 'integer', format: 'int32'}
  }

  class MyController {
    @get('Pets/{category}')
    list(
      @param(categorySpec) category: string,
      @param(pageSizeSpec) pageSize?: number,
    ) {}
  }
  ```

  Writing the whole parameter specification is tedious, so we've created shortcuts to define
  the params with the pattern `@param.${in}.${type}(${name})`:

  - in: The parameter location. It can be one of the following values: `query`, `header`, `path`.
  - type: A [common name of OpenAPI primitive data type](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#data-types). 
  - name: Name of the parameter. It should be a `string`.

  A list of available shortcuts for `query` can be found in [API document](http://apidocs.loopback.io/@loopback%2fopenapi-v3/#param.query),
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

  You can find specific use cases in [Writing Controller methods](Controllers.md#writing-controller-methods)

  *The parameter location cookie is not supported yet, see*
  *https://github.com/strongloop/loopback-next/issues/997*

### RequestBody Decorator

  Syntax: see [API documentation](https://github.com/strongloop/loopback-next/blob/0739ffcfe3ef50e0bfd86055c0f4e29fd6925be0/packages/openapi-v3/src/request-body-decorator.ts#L20-L79)

  `@requestBody()` is applied to a controller method parameter to generate OpenAPI requestBody specification for it.
  
  *Only one parameter can be decorated by `@requestBody` per controller method.*

  A typical [OpenAPI requestBody specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject)
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

  In order to use `@requestBody`, the parameter type it's decorating needs to have its model decorated with `@model` and `@property`:
  
  ```ts
  import {model, property} from '@loopback/repository';
  import {Address} from './address.model';

  @model()
  class User {
    @property()
    firstname: string
    @property()
    lastname: string
    @property()
    address: Address
  }
  ```
  *To learn more about decorating models and the corresponding OpenAPI schema, please check
  [model decorators](#model-decorators).*

  This allows type information of the model to be visible to the spec generator so that `@requestBody` can be used on the parameter:

  ```ts
  // in file '/src/controllers/user.controller.ts'
  import {User} from '../models/user'
  import {put} from '@loopback/rest'

  class UserController {
    @put('/Users/{id}')
    async replaceUser(
      @param.path.string('id') id: string,
      @requestBody() user: User
    ) {}
  }
  ```

  For the simplest use case, you can leave the input of `@requestBody` empty
  since we automatically detect the type of `user` and generate the corresponding schema for it. 
  The default content type is set to be `application/json`.

  You can also customize the generated `requestBody` specification in 3 ways:

  * add optional fields `description` and `required`

  ```ts
  class MyController {
    @put('/Users/{id}')
    async replaceUser(
      @param.path.string('id') id: string,
      @requestBody({
        description: 'a modified user',
        required: true
      }) user: User
    ) {}
  }
  ```
  
  * override the content type or define multiple content types

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
        } 
      }) user: User
    ) {}
  }
  ```

  * override the schema specification

  ```ts
  import {UserSchema, User} from '../model/user-schema';
  
  class MyController {
    @put('/Users/{id}')
    async replaceUser(
      @param.path.string('id') id: string,
      @requestBody({
        content: {
          'application/json': UserSchema
        } 
      }) user: User
    ) {}
  }
  ```

  *We are supporting more `@requestBody` shortcuts in the future, track the feature in story*
  *https://github.com/strongloop/loopback-next/issues/1064*

## Dependency Injection

`@inject` is a decorator to annotate method arguments for automatic injection by
LoopBack's IoC container.

The injected values are applied to a constructed instance, so it can only be
used on non-static properties or constructor parameters of a Class.

The `@inject` decorator allows you to inject dependencies bound to any
implementation of the [Context](#context) object, such as an Application
instance or a request context instance. You can bind values, class definitions
and provider functions to those contexts and then resolve values (or the results
of functions that return those values!) in other areas of your code.

```ts
// application.ts
import {Application} from '@loopback/core';
import 'fs-extra';
class MyApp extends Application {
  constructor() {
    super();
    const app = this;
    const widgetConf = JSON.parse(fs.readSync('./widget-config.json'));
    function logInfo(info) {
      console.log(info);
    }
    app.bind('config.widget').to(widgetConf);
    app.bind('logger.widget').to(logInfo);
  }
}
```

Now that we've bound the 'config.widget' key to our configuration object, and
'logger.widget' key to the function `logInfo()`, we can inject them in our
WidgetController:

```ts
// widget-controller.ts
import {widgetSpec} from '../apispec';
@api(widgetSpec)
class WidgetController {
  // injection for property
  @inject('logger.widget') private logger: Function;

  // injection for constructor parameter
  constructor(
    @inject('config.widget') protected widget: any, // This will be resolved at runtime!
  ) {}
  // etc...
}
```

A few variants of `@inject` are provided to declare special forms of
dependencies:

- `@inject.getter`: inject a getter function that returns a promise of the bound
  value of the key

Syntax: `@inject.getter(bindingKey: string)`.

```ts
class HelloController {
  constructor(
    @inject.getter('authentication.currentUser')
    private userGetter: Getter<UserProfile>,
  ) {}

  async greet() {
    const user = await this.userGetter();
    return `Hello, ${user.name}`;
  }
}
```

- `@inject.setter`: inject a setter function to set bound value of the key

Syntax: `@inject.setter(bindingKey: string)`.

```ts
class HelloController {
  constructor(
    @inject.setter('greeting') private greetingSetter: Setter<string>,
  ) {}

  greet() {
    greetingSetter('my-greeting-message');
  }
}
```

- `@inject.tag`: inject an array of values by a pattern or regexp to match
  binding tags

Syntax: `@inject.tag(tag: string | RegExp)`.

```ts
class Store {
  constructor(@inject.tag('store:location') public locations: string[]) {}
}

ctx.bind('store').toClass(Store);
ctx
  .bind('store.locations.sf')
  .to('San Francisco')
  .tag('store:location');
ctx
  .bind('store.locations.sj')
  .to('San Jose')
  .tag('store:location');
const store = ctx.getSync<Store>('store');
// `store.locations` is now `['San Francisco', 'San Jose']`
```

- `@inject.context`: inject the current context

Syntax: `@inject.context()`.

```ts
class MyComponent {
  constructor(@inject.context() public ctx: Context) {}
}

const ctx = new Context();
ctx.bind('my-component').toClass(MyComponent);
const component = ctx.getSync<MyComponent>('my-component');
// `component.ctx` should be the same as `ctx`
```

**NOTE**: It's recommended to use `@inject` with specific keys for dependency
injection if possible. Use `@inject.context` only when the code need to access
the current context object for advanced use cases.

For more information, see the [Dependency Injection](Dependency-Injection.md)
section under [LoopBack Core Concepts](Concepts.md)

## Authentication Decorator

Syntax: `@authenticate(strategyName: string, options?: Object)`

Marks a controller method as needing an authenticated user. This decorator
requires a strategy name as a parameter.

Here's an example using 'BasicStrategy': to authenticate user in function
`whoAmI`:

```ts
// my-controller.ts
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';

class MyController {
  constructor(
    @inject(BindingKeys.Authentication.CURRENT_USER) private user: UserProfile,
  ) {}

  @authenticate('BasicStrategy')
  async whoAmI(): Promise<string> {
    return this.user.id;
  }
}
```

## Repository Decorators

As a Domain-driven design concept, the repository is a layer between your domain
object and data mapping layers using a collection-like interface for accessing
domain objects.

In LoopBack, a domain object is usually a TypeScript/JavaScript Class instance,
and a typical example of a data mapping layer module could be a database's
node.js driver.

LoopBack repository encapsulates your TypeScript/JavaScript Class instance, and
its methods that communicate with your database. It is an interface to implement
data persistence.

Repository decorators are used for defining models(domain objects) for use with
your chosen datasources, and the navigation strategies among models.

If you are not familiar with repository related concepts like `Model`, `Entity`
and `Datasource`, please see LoopBack concept [Repositories](#Repositories.md)
to learn more.

### Model Decorators

Model is a Class that LoopBack builds for you to organize the data that share
same configurations and properties. You can use model decorators to define a
model and its properties.

#### Model Decorator

Syntax: `@model(definition?: ModelDefinitionSyntax)`

Model decorator is a Class decorator. In LoopBack 4, we inherit the model
definition format from LoopBack 3, you can find it in
[Model definition JSON file](https://loopback.io/doc/en/lb3/Model-definition-JSON-file).
For usage examples, see [Define Models](Repositories.md#define-models)

_Please note we will elaborate more about model and model definition in
\#Model.htm,_ _and replace the link above with LoopBack 4 link_

By using a model decorator, you can define a model as your repository's
metadata, then you have two choices to create the repository instance:

One is to inject your repository and resolve it with Legacy Juggler that
complete with CRUD operations for accessing the model's data. A use case can be
found in section [Repository decorator](#repository-decorator)

The other one is defining your own repository without using legacy juggler, and
use an ORM/ODM of your choice.

```ts
// Missing example here
// Will be provided in Model.htm
// refer to [example code](https://github.com/strongloop/loopback-next-example/blob/master/services/account-without-juggler/repositories/account/models/Account.ts)
```

#### Property Decorator

Syntax: `@property(definition?: PropertyDefinition)`

The property decorator defines metadata for a property on a Model definition.
The format of property definitions can be found in
[Property definitions](https://loopback.io/doc/en/lb2/Model-definition-JSON-file.html#properties)

For usage examples, see [Define Models](Repositories.md#define-models)

### Relation Decorators

The relation decorator defines the nature of a relationship between two models.

_This feature has not yet been released in alpha form. Documentation will be_
_added here as this feature progresses._

#### Relation Decorator

Syntax: `@relation`

Register a general relation.

#### Specific Relation Decorator

Syntax:

- `@belongsTo`
- `@hasOne`
- `@hasMany`
- `@embedsOne`
- `@embedsMany`
- `@referencesOne`
- `@referencesMany`

Register a specific relation

### Repository Decorator

Syntax:

```ts
@repository(model: string | typeof Entity, dataSource?: string | juggler.DataSource)
```

This decorator either injects an existing repository or creates a repository
from a model and a datasource.

The injection example can be found in
[Repository#controller-configuration](Repositories.md#controller-configuration)

To create a repository in a controller, you can define your model and datasource
first, then import them in your controller file:

_To learn more about creating model and datasource, please see the example in
[Thinking in LoopBack](Thinking-in-LoopBack.htm#define-product-model-repository-and-data-source)_

```ts
// my-controller.ts
import { Todo } from '{path_of_Todo_model}.ts';
import { datasource } from '{path_of_datasource}.ts';

export class TodoController {
  @repository(Todo, datasource)
  repository: EntityCrudRepository<Todo, number>;
  ... ...
}
```

If the model or datasource is already bound to the app, you can create the
repository by providing their names instead of the classes. For example:

```ts
// with `datasource` and `Todo` already defined.
app.bind('datasources.ds').to(datasource);
app.bind('repositories.todo').to(Todo);

export class TodoController {
  @repository('todo', 'ds')
  repository: EntityCrudRepository<Todo, number>;
  // etc
}
```
