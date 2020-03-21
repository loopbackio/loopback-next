---
lang: en
title: 'Migrating model mixins'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-mixins.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

## Introduction

This document will guide you in migrating custom model mixins, and custom
method/remote method mixins in LoopBack 3 to their equivalent implementations in
LoopBack 4.

For an understanding of how models in LoopBack 3 are now architectually
decoupled into 3 classes (model, repository, and controller) please read
[Migrating custom model methods](./methods.md).

In LoopBack 3, it was easy to add property mixins and method
[mixins](https://loopback.io/doc/en/lb3/Defining-mixins.html).

In LoopBack 4, it is also easy and is accomplished by using a mixin class
factory function.

## Creating a Property Mixin

This section covers the approach that LoopBack 3 and LoopBack 4 can use to add a
property to a model via a mixin.

### LoopBack 3 Approach

In LoopBack 3, a developer is able to create a model property mixin by:

- placing the mixin logic in a file in a mixins directory
- updating the server/model-config.json file with the mixin directory location
- updating the model's json file to include the mixin's name and a boolean

As an example, we will create a mixin that adds a **category** property to a
model.

#### Defining The Model Property Mixin category.js

The developer defines a model property mixin in **common/mixins/category.js**
which adds a required property named `category` to any model.

{% include code-caption.html content="common/mixins/category.js" %}

```js
module.exports = function (Model, options) {
  Model.defineProperty('category', {type: 'string', required: true});
};
```

#### Updating model-config.json

The **server/model-config.json** needs to contain:

- the locations of all **models**
- the location of all **mixins**
- the entry of the model that receives the mixin content (for this example
  `Note`)

{% include code-caption.html content="server/model-config.json" %}

```
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins"
    ]
  },

 // ... other entries

  "Note": {
    "dataSource": "db"
  }
}

```

Please see
[Reference mixins in model-config.js](https://loopback.io/doc/en/lb3/Defining-mixins.html#reference-mixins-in-model-configjs)
for a short explanation of this file.

#### Applying The category.js Mixin To A Model

To extend the model `Note` with the **category.js** mixin, we need to add a
**mixins** section in **common/models/note.json** to indicate which mixins
should be applied to it.

{% include code-caption.html content="common/models/note.json" %}

```json
{
  "name": "Note",
  "properties": {
    "title": {
      "type": "string",
      "required": true
    },
    "content": {
      "type": "string"
    }
  },
  "mixins": {
    "Category": true
  }
}
```

Specifying a value of **true** for `Category` will apply the **category.js**
property model mixin to the `Note` model. A value of **false** will not apply
the mixin.

### LoopBack 4 Approach

In LoopBack 4, a developer is able to create a model property mixin by:

- creating a base model class which extends `Entity`
- placing the mixin class factory function in a separate file
- generating a model using the CLI as usual
- adjusting the model file to make use of the mixin class factory function

#### Defining A BaseEntity Class Which Extends Entity

Let's define a base model class `BaseEntity` in **src/models/base-entity.ts**.
It will be used as input to the mixin later.

{% include code-caption.html content="src/models/base-entity.ts" %}

```ts
import {Entity} from '@loopback/repository';
export class BaseEntity extends Entity {}
```

This is necessary because the
[Entity](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/model.ts#L276)
class is abstract and doesn't have a constructor.

#### Defining The Model Property Mixin Class Factory Function

This mixin class factory function `AddCategoryPropertyMixin` in
**src/mixins/category-property-mixin.ts** adds the required property
**category** to any model.

{% include code-caption.html content="src/mixins/category-property-mixin.ts" %}

```ts
import {Constructor} from '@loopback/context';
import {property, Model} from '@loopback/repository';

/**
 * A mixin factory to add `category` property
 *
 * @param superClass - Base Class
 * @typeParam T - Model class
 */
export function AddCategoryPropertyMixin<T extends Constructor<Model>>(
  superClass: T,
) {
  class MixedModel extends superClass {
    @property({
      type: 'string',
      required: true,
    })
    category: string;
  }
  return MixedModel;
}
```

{% include note.html content="At the moment, [TypeScript does not allow decorators in class expressions](https://github.com/microsoft/TypeScript/issues/7342). This is why we need to declare the class with a name, and then return it." %}

#### Generating A Model Via The CLI

A CLI-generated model named `Note` with 3 properties: **id**, **title**, and
**content** would look like this:

{% include code-caption.html content="src/models/note.model.ts" %}

```ts
import {Entity, model, property} from '@loopback/repository';

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

#### Adjusting The Model File To Use AddCategoryPropertyMixin

The model file only requires a few adjustments:

- import the `BaseEntity` class
- import the `AddCategoryPropertyMixin` mixin
- Change the class declaration of `Note` so that it extends the class returned
  from the mixin function which takes in the `BaseEntity` superclass as input

{% include code-caption.html content="src/models/note.model.ts" %}

```ts
import {model, property} from '@loopback/repository';
import {AddCategoryPropertyMixin} from '../mixins/category-property-mixin';
import {BaseEntity} from './base-entity';

@model()
export class Note extends AddCategoryPropertyMixin(BaseEntity) {
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

The required property `category` has now been added to the `Note` model via a
mixin class factory function.

## Creating A Custom Model Method And Remote Model Method Mixin

This section covers the approach that LoopBack 3 can use to add a custom method
/remote method to a model via a mixin, and similarly how LoopBack 4 can add a
custom method to a repository and controller via a mixin.

### LoopBack 3 Approach

The
[Add a New Model Method And a New Endpoint](./methods.md#add-a-new-model-method-and-a-new-endpoint)
section of the [Migrating custom model methods](./methods.md) document explains
how a LoopBack 3 developer can define a custom model method named `findByTitle`
on the `Note` model, and define a remote method to make it available as a new
endpoint.

In this section, we will show how a LoopBack 3 developer can define a mixin to
accomplish this.

In LoopBack 3, a developer is able to create a custom model method/remote method
mixin by:

- placing the mixin logic in a file in a mixins directory
- updating the server/model-config.json file with the mixin directory location
- updating the model's json file to include the mixin's name (and options object
  or boolean)

#### Defining The Model Method Mixin findByTitle.js

The developer defines a custom model method/remote method mixin in
**common/mixins/findByTitle.js** which adds a custom method `findByTitle` to any
model, and adds a corresponding remote method definition with path
`/findByTitle` as well. An options property `returnArgumentName` makes it
possible to customize the name of the return argument. If it is not specified,
the return argument of 'items' is used as a default.

{% include code-caption.html content="common/mixins/findByTitle.js" %}

```js
module.exports = function (Model, options) {
  const returnArgumentName = options.returnArgumentName
    ? options.returnArgumentName
    : 'items';

  Model.remoteMethod('findByTitle', {
    http: {
      path: '/findByTitle',
      verb: 'get',
    },
    accepts: {arg: 'title', type: 'string'},
    returns: {arg: returnArgumentName, type: [Model], root: true},
  });

  Model.findByTitle = function (title, cb) {
    var titleFilter = {
      where: {
        title: title,
      },
    };
    Model.find(titleFilter, cb);
  };
};
```

For a model named `Note`, this will expose an endpoint of `/Notes/findByTitle`.

Ensure **model-config.json** is set up properly as specified earlier in
[Updating model-config.json](#updating-model-config.json)

#### Applying The findByTitle.js Mixin To A Model

To extend the model `Note` with the **findByTitle.js** mixin, we need to add a
**mixins** section in **common/models/note.json** to indicate which mixins
should be applied to it.

{% include code-caption.html content="common/models/note.json" %}

```json
{
  "name": "Note",
  "properties": {
    "title": {
      "type": "string",
      "required": true
    },
    "content": {
      "type": "string"
    }
  },

  "mixins": {
    "FindByTitle": {
      "returnArgumentName": "notes"
    },

    "Category": true
  }
}
```

Specifying an options object for `FindByTitle` is the same as specifying a value
of **true** as it will apply the **findByTitle.js** custom model method/remote
method mixin to the `Note` model. A value of **false** will not apply the mixin.

### LoopBack 4 Approach

As mentioned in the previous section, the
[Add a New Model Method And a New Endpoint](./methods.md#add-a-new-model-method-and-a-new-endpoint)
section of the [Migrating custom model methods](./methods.md) document explains
how a LoopBack 3 developer can define a custom model method named `findByTitle`
on the `Note` model, and define a remote method to make it available as a new
endpoint. It then shows how a LoopBack 4 developer can implement a `findByTitle`
method on the `NoteRepository` and on the `NoteController` to accomplish the
same thing.

In this section, we will show how a LoopBack 4 developer can define two mixins (
a repository mixin and a controller mixin) to add a `findByTitle` method to
`NoteRepository` and `NoteController` respectively.

In LoopBack 4, a developer is able to create a repository and controller method
mixin by:

- defining a common interface for both mixin class factory functions
- placing the mixin class factory functions in separate files
- generating a repository and controller using the CLI as usual
- adjusting the repository and controller files to make use of its respective
  mixin class factory function

#### Defining A Common Interface For The findByTitle Method

Let's define a common interface `FindByTitle` in
**src/mixins/find-by-title-interface.ts**.

{% include code-caption.html content="src/mixins/find-by-title-interface.ts" %}

```ts
import {Model} from '@loopback/repository';

/**
 * An interface to allow finding notes by title
 */
export interface FindByTitle<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}
```

#### Defining A Repository Mixin Class Factory Function

In **src/mixins/find-by-title-repository-mixin.ts**, let's define the mixin
class factory function `FindByTitleRepositoryMixin` which adds the `findByTitle`
method to any repository.

{% include code-caption.html content="src/mixins/find-by-title-repository-mixin.ts" %}

```ts
import {Constructor} from '@loopback/context';
import {Model, CrudRepository, Where} from '@loopback/repository';
import {FindByTitle} from './find-by-title-interface';

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model which extends Model
 *
 * @param superClass - Base class
 *
 * @typeParam M - Model class which extends Model
 * @typeParam R - Repository class
 */
export function FindByTitleRepositoryMixin<
  M extends Model & {title: string},
  R extends Constructor<CrudRepository<M>>
>(superClass: R) {
  class MixedRepository extends superClass implements FindByTitle<M> {
    async findByTitle(title: string): Promise<M[]> {
      const where = {title} as Where<M>;
      const titleFilter = {where};
      return this.find(titleFilter);
    }
  }
  return MixedRepository;
}
```

#### Generating A Repository Via The CLI

A CLI-generated repository for a model `Note` would look like this:

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

#### Adjusting NoteRepository To Use FindByTitleRepositoryMixin

The repository file only requires a few adjustments:

- import the `FindByTitleRepositoryMixin` mixin class factory function
- adjust the declaration of the `NoteRepository` class to extend the class
  returned from the mixin function which takes in the `DefaultCrudRepository`
  superclass as input.

{% include code-caption.html content="src/repositories/note.repository.ts" %}

```ts
import {FindByTitleRepositoryMixin} from '../mixins/find-by-title-repository-mixin';
import {DefaultCrudRepository} from '@loopback/repository';
import {Note, NoteRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Constructor} from '@loopback/core';

/**
 * A repository for `Note` with `findByTitle`
 */
export class NoteRepository extends FindByTitleRepositoryMixin<
  Note,
  Constructor<
    DefaultCrudRepository<Note, typeof Note.prototype.id, NoteRelations>
  >
>(DefaultCrudRepository) {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Note, dataSource);
  }
}
```

We have now added the `findByTitle` method to a repository via a mixin class
factory function.

#### Defining A Controller Mixin Class Factory Function

In **src/mixins/find-by-title-controller-mixin.ts**, let's define the mixin
class factory function `FindByTitleControllerMixin` which adds the `findByTitle`
method to any controller.

{% include code-caption.html content="src/mixins/src/mixins/find-by-title-controller-mixin.ts" %}

```ts
import {Constructor} from '@loopback/context';
import {Model} from '@loopback/repository';
import {FindByTitle} from './find-by-title-interface';
import {param, get, getModelSchemaRef} from '@loopback/rest';

/**
 * Options to mix in findByTitle
 */
export interface FindByTitleControllerMixinOptions {
  /**
   * Base path for the controller
   */
  basePath: string;
  /**
   * Model class for CRUD
   */
  modelClass: typeof Model;
}

/**
 * A mixin factory for controllers to be extended by `FindByTitle`
 * @param superClass - Base class
 * @param options - Options for the controller
 *
 * @typeParam M - Model class
 * @typeParam T - Base class
 */
export function FindByTitleControllerMixin<
  M extends Model,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Constructor<any> = Constructor<object>
>(superClass: T, options: FindByTitleControllerMixinOptions) {
  class MixedController extends superClass implements FindByTitle<M> {
    @get(`${options.basePath}/findByTitle/{title}`, {
      responses: {
        '200': {
          description: `Array of ${options.modelClass.modelName} model instances`,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(options.modelClass, {
                  includeRelations: true,
                }),
              },
            },
          },
        },
      },
    })
    async findByTitle(@param.path.string('title') title: string): Promise<M[]> {
      return this.repository.findByTitle(title);
    }
  }

  return MixedController;
}
```

To customize certain portions of the OpenAPI description of the endpoint, the
mixin class factory function needs to accept some options. We defined an
interface `FindByTitleControllerMixinOptions` to allow for this.

It is also a good idea to give the injected repository (in the controller super
class) a generic name like `this.respository` to keep things simple in the mixin
class factory function.

#### Generating A Controller Via The CLI

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

#### Adjusting NoteController To Use FindByTitleControllerMixin

The controller file only requires a few adjustments:

- import the `FindByTitleControllerMixinOptions` interface
- import the `FindByTitleControllerMixin` mixin class factory function
- prepare the options for the mixin
- adjust the declaration of the `NoteController` class to extend the class
  returned from the mixin function which takes in the `Object` superclass as
  input.
- pass the input options into the mixin
- change the name of the injected repository from `noteRepository` to
  `repository` to keep things simple for the mixin class factory function

{% include code-caption.html content="src/controllers/note.controller.ts" %}

```ts
import {Note} from '../models';
import {
  FindByTitleControllerMixin,
  FindByTitleControllerMixinOptions,
} from '../mixins/find-by-title-controller-mixin';
import {Constructor} from '@loopback/core';

import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {NoteRepository} from '../repositories';

const options: FindByTitleControllerMixinOptions = {
  basePath: '/notes',
  modelClass: Note,
};

export class NoteController extends FindByTitleControllerMixin<
  Note,
  Constructor<Object>
>(Object, options) {
  constructor(
    @repository(NoteRepository)
    public repository: NoteRepository,
  ) {
    super();
  }

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
    return this.repository.create(note);
  }

  // ...
  // remaining CRUD endpoints
  // ...
}
```

We have now added the `findByTitle` method to a controller via a mixin class
factory function.

This will also expose an endpoint of `/notes/findByTitle/{title}`.

## Summary

As the examples above show, migrating mixins from LoopBack 3 to LoopBack 4 is
relatively straightforward using class factory functions.
