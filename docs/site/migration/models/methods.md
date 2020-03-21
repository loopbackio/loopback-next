---
lang: en
title: 'Migrating custom model methods'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-methods.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

## Introduction

This document will guide you in migrating custom model methods in LoopBack 3 to
their equivalent implementations in LoopBack 4.

In LoopBack 3, a model class has three responsibilities: a model describing
shape of data, a repository providing data-access APIs, and a controller
implementing REST API.

In LoopBack 4,

- data-access APIs are implemented by [repositories](../../Repositories.md) that
  are decoupled from models.
- REST APIs are implemented by [controllers](docs/site/Controllers.md) that are
  decoupled from models.

A `Repository` represents a specialized service interface that provides
strong-typed data access (for example, CRUD) operations of a domain model
against the underlying database or service. A single model can be used with
multiple different repositories. A Repository can be defined and implemented by
application developers. LoopBack ships a few predefined repository interfaces
for typical CRUD and KV operations. These repository implementations leverage
model definition and dataSource configuration to fulfill the logic for data
access. See more examples at
[Repository/CrudRepository/EntityRepository](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/repositories/repository.ts)
and
[KeyValueRepository](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/repositories/kv.repository.ts).

A `Controller` is a class that implements operations defined by an application’s
API. It implements an application’s business logic and acts as a bridge between
the HTTP/REST API and domain/database models. A Controller operates only on
processed input and abstractions of backend services / databases.

Before we discuss any customizations and how to migrate them, let's first go
over some LoopBack 4 basics with regards to models, repositories, and
controllers.

A CLI-generated model named `Note` would look like this:

{% include code-caption.html content="src/models/note.model.ts" %}

```ts
@model()
export class Note extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  content?: string;

  constructor(data?: Partial<Note>) {
    super(data);
  }
}

export interface NoteRelations {
  // describe navigational properties here
}

export type NoteWithRelations = Note & NoteRelations;
```

A [model](docs/site/Model.md) describes business domain objects, for example,
Customer, Address, and Order. It usually defines a list of properties with name,
type, and other constraints like [relations](docs/site/Relations.md).

A CLI-generated **repository** for a model `Note` would look like this:

{% include code-caption.html content="src/repositories/note.repository.ts" %}

```ts
export class NoteRepository extends DefaultCrudRepository<
  Note,
  typeof Note.prototype.id,
  NoteRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Note, dataSource);
  }
}
```

It extends
[DefaultCrudRepository](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/repositories/legacy-juggler-bridge.ts)
. It handles all persistence operations against the datasource.

A CLI-generated **controller** for the model `Note` would look like this: (To
save space, only a **partial** implementation is shown)

{% include code-caption.html content="src/controllers/note.controller.ts" %}

```ts
export class NoteController {
  constructor(
    @repository(NoteRepository)
    public noteRepository: NoteRepository,
  ) {}

  @post('/notes', {
    responses: {
      '200': {
        description: 'Note model instance',
        content: {'application/json': {schema: getModelSchemaRef(Note)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Note, {
            title: 'NewNote',
            exclude: ['id'],
          }),
        },
      },
    })
    note: Omit<Note, 'id'>,
  ): Promise<Note> {
    return this.noteRepository.create(note);
  }

  // ...
  // remaining CRUD endpoints
  // ...
}
```

For a full example of a CLI-generated controller for a model `Todo`, see
[TodoController ](https://github.com/strongloop/loopback-next/blob/master/examples/todo/src/controllers/todo.controller.ts).

One of the first things you will notice in the controller is that it injects the
repository `NoteRepository` to handle all persistence operations.

Looking at `NoteController`'s `create` method, you will notice that it is
decorated with a `@post` decorator to indicate that it handles POST requests. It
also defines the endpoint url `'/notes'` and its OpenAPI operation
specification. The controller's `create` method relies on the `NoteRepository`'s
`create` method to handle the actual persistence operation.

The remaining controller methods are set up in a similar way.

## LoopBack 3 Approaches to Customizing Model Methods

In LoopBack 3, a developer is able to customize model methods in various ways:

- [configure which endpoints are public](#configure-which-endpoints-are-public)
- [customize model method, but not the endpoint](#customize-model-method-but-not-the-endpoint)
- [add a new model method and a new endpoint](#add-a-new-model-method-and-a-new-endpoint)

In the sections below, we will show some examples of these, and how to implement
them in LoopBack 4.

## Configure Which Endpoints are public

By default, LoopBack 3 and 4 automatically makes each endpoint public. Steps
must be taken in LoopBack 3 and 4 to prevent an endpoint from being public.

### LoopBack 3 Approach

In LoopBack 3 LoopBack models automatically have a standard set of HTTP
endpoints that provide REST APIs for create, read, update, and delete (CRUD)
operations on model data.

To control whether the REST API from is public or not, the developer has two
options:

- specifying certain options in `server/model-config.json`
- calling `disableRemoteMethodByName()` from model's script file

See
[Exposing and hiding models, methods, and endpoints](https://loopback.io/doc/en/lb3/Exposing-models-over-REST.html#exposing-and-hiding-models-methods-and-endpoints)
for details.

{% include code-caption.html content="/server/model-config.json" %}

```json
"Note": {
  "public": true,
  "dataSource": "db"
},
```

This exposes all the REST API endpoints of the model. The default for `public`
is `true`, so it is not necessary to add this property at all. But doing so
makes it very clear. To **hide** all the REST API endpoints of the model, simply
change `public` to `false`.

{% include code-caption.html content="/server/model-config.json" %}

```json
"MyUser": {
  "public": true,
  "dataSource": "db",
  "options": {
    "remoting": {
      "sharedMethods": {
        "*": false,
        "login": true,
        "logout": true
      }
    }
  }
}
```

This hides all the REST API endpoints of the model, except `login and logout`.

{% include code-caption.html content="common/models/Note.js" %}

```js
Note.disableRemoteMethodByName('create');
Note.disableRemoteMethodByName('upsert');
Note.disableRemoteMethodByName('deleteById');
...
```

This disables specific REST API endpoints of the model by name.

### LoopBack 4 Approach

As mentioned earlier, REST API endpoints are implemented by a controller class.
Preventing an endpoint from being public is simple.

To **hide** a particular REST API endpoint, simply **delete** the appropriate
function and its decorator from the controller class.

To **hide all** REST API endpoints of a particular model, simply **do not
create** a controller class for it.

## Customize Model Method But Not the Endpoint

LoopBack 3 and 4 provide a lot of out-of-the-box functionality for developers
with regards to data-access APIs and REST APIs. Only a few steps are required to
create minor customizations.

### LoopBack 3 Approach

To override the behaviour of a
[PersistedModel](https://apidocs.loopback.io/loopback/#persistedmodel) the
developer has two options for writing **custom methods**:

- [Via server boot script](https://loopback.io/doc/en/lb3/Customizing-models.html#via-server-boot-script)
- [Via model's script](https://loopback.io/doc/en/lb3/Customizing-models.html#via-your-models-script)

The two approaches above are similar, so, for brevity, we will only discuss the
`model script` approach in the examples below.

The following LB3 code snippet shows how to customize the built-in
[find()](https://apidocs.loopback.io/loopback/#persistedmodel-find) method for
the model `Note`.

{% include code-caption.html content="common/models/Note.js" %}

```js
module.exports = function (Note) {
  Note.on('dataSourceAttached', function (obj) {
    var find = Note.find;
    var cache = {};

    Note.find = function (filter, options, cb) {
      var key = '';
      if (filter) {
        key = JSON.stringify(filter);
      }
      var cachedResults = cache[key];
      if (cachedResults) {
        console.log('serving from cache');
        process.nextTick(function () {
          cb(null, cachedResults);
        });
      } else {
        console.log('serving from db');
        find.call(Note, function (err, results) {
          if (!err) {
            cache[key] = results;
          }
          cb(err, results);
        });
      }
    };
  });
};
```

It basically builds up a cache to limit database queries. No changes are made to
any REST API endpoint settings.

### LoopBack 4 Approach

As mentioned earlier, in LoopBack 4, data-access APIs are implemented by
repositories. The repository for your model usually extends a default
implementation. So to customize the behaviour of a particular method, you simply
override this method in your repository class.

The following LB4 code snippets show how to customize the **find** method of
`NoteRepository`.

{% include code-caption.html content="src/repositories/note.repository.ts" %}

```ts
export class NoteRepository extends DefaultCrudRepository<
  Note,
  typeof Note.prototype.id,
  NoteRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @inject('my.cache') private cache: Map<string, Note[]>,
  ) {
    super(Note, dataSource);
  }

  async find(
    filter?: Filter<Note>,
    options?: Options,
  ): Promise<(Note & NoteRelations)[]> {
    let key: string = '';
    if (filter) {
      key = JSON.stringify(filter);
    }

    let cachedResults: Note[] | undefined = this.cache.get(key);

    if (cachedResults) {
      console.log('serving from cache');
      return cachedResults;
    } else {
      console.log('serving from db');

      let results: Note[] | undefined = await super.find(filter, options);
      this.cache.set(key, results);

      return results;
    }
  }
}
```

The cache is injected into the repository.

It was defined in the application class:

{% include code-caption.html content="src/application.ts" %}

```ts
export class NoteApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  private cache: Map<string, Note[]> = new Map();

  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.bind('my.cache').to(this.cache);

    // ...
  }
}
```

No changes are made to any REST API endpoint settings in `NoteController`.

## Add a New Model Method And a New Endpoint

LoopBack 3 and 4 provide a lot of out-of-the-box functionality for developers
with regards to data-access APIs and REST APIs. Only a few steps are required to
create minor additions.

### LoopBack 3 Approach

The following LB3 code snippet shows how to customize the `Note` model by adding
a **new** persisted model method `findByTitle`, and defining a **new** remote
method for its respective endpoint `/findByTitle`. The full endpoint url will
end up being `/Notes/findByTitle`.

{% include code-caption.html content="common/models/Note.js" %}

```js
module.exports = function (Note) {
  Note.remoteMethod('findByTitle', {
    http: {
      path: '/findByTitle',
      verb: 'get',
    },
    accepts: {arg: 'title', type: 'string'},
    returns: {arg: 'note', type: [Note], root: true},
  });

  Note.findByTitle = function (title, cb) {
    var titleFilter = {
      where: {
        title: title,
      },
    };
    Note.find(titleFilter, function (err, foundNotes) {
      if (err) {
        cb(err);
      } else {
        cb(null, foundNotes);
      }
    });
  };
};
```

### LoopBack 4 Approach

To accomplish the same thing in LoopBack 4, we can add a **new** method
`findByTitle` to `NoteRepository`, a **new** method `findByTitle` to
`NoteController`, and specify an endpoint url of `/notes/byTitle/{title}`.

{% include code-caption.html content="src/repositories/note.repository.ts" %}

```ts
export class NoteRepository extends DefaultCrudRepository<
  Note,
  typeof Note.prototype.id,
  NoteRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Note, dataSource);
  }

  async findByTitle(title: string): Promise<Note[]> {
    const titleFilter = {
      where: {
        title: title,
      },
    };
    const foundNotes = await this.find(titleFilter);
    return foundNotes;
  }
}
```

{% include code-caption.html content="src/controllers/note.controller.ts" %}

```ts
export class NoteController {
  constructor(
    @repository(NoteRepository)
    public noteRepository: NoteRepository,
  ) {}

  @get('/notes/byTitle/{title}', {
    responses: {
      '200': {
        description: 'Array of Note model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Note, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async findByTitle(
    @param.path.string('title') title: string,
  ): Promise<Note[]> {
    return this.noteRepository.findByTitle(title);
  }

  // ...
  // remaining CRUD endpoints
  // ...
}
```

## Summary

As the examples above show, migrating custom model methods from LoopBack 3 to
LoopBack 4 is relatively straightforward.
