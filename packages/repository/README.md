# @loopback/repository

This module provides a common set of interfaces for interacting with databases.

## Overview

This module provides data access facilities to various databases and services as
well as the constructs for modeling and accessing those data.

## Installation

```sh
npm install --save @loopback/repository
```

## Basic use

At the moment, we only have implementations of `Repository` based on LoopBack
3.x `loopback-datasource-juggler` and connectors. The following steps illustrate
how to define repositories and use them with controllers.

### Defining a legacy datasource and a model

The repository module provides APIs to define LoopBack 3.x data sources and
models. For example,

```ts
// src/datasources/db.datasource.ts
import {juggler} from '@loopback/repository';

export const db: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});
```

```ts
// src/models/note.model.ts
import {model, Entity, property} from '@loopback/repository';

@model()
export class Note extends Entity {
  @property({id: true})
  id: string;
  @property()
  title: string;
  @property()
  content: string;
}

export interface NoteRelations {
  // describe navigational properties here
}

export type NoteWithRelations = Note & NoteRelations;
```

**NOTE**: There is no declarative support for data source and model yet in
LoopBack 4. These constructs need to be created programmatically as illustrated
above.

### Defining a repository

A repository can be created by extending `DefaultCrudRepository` and using
dependency injection to resolve the datasource.

```ts
// src/repositories/note.repository.ts
import {DefaultCrudRepository, DataSourceType} from '@loopback/repository';
import {Note, NoteRelations} from '../models';
import {inject} from '@loopback/core';

export class NoteRepository extends DefaultCrudRepository<
  Note,
  typeof Note.prototype.id,
  NoteRelations
> {
  constructor(@inject('datasources.db') protected dataSource: DataSourceType) {
    super(Note, dataSource);
  }
}
```

### Defining a controller

Controllers serve as handlers for API requests. We declare controllers as
classes with optional dependency injection by decorating constructor parameters
or properties.

```ts
// src/controllers/note.controller.ts
import {repository} from '@loopback/repository';
import {NoteRepository} from '../repositories';
import {Note} from '../models';
import {post, requestBody, get, param} from '@loopback/rest';

export class NoteController {
  constructor(
    // Use constructor dependency injection to set up the repository
    @repository(NoteRepository) public noteRepo: NoteRepository,
  ) {}

  // Create a new note
  @post('/note')
  create(@requestBody() data: Note) {
    return this.noteRepo.create(data);
  }

  // Find notes by title
  @get('/note/{title}')
  findByTitle(@param.path.string('title') title: string) {
    return this.noteRepo.find({where: {title}});
  }
}
```

### Run the controller and repository together

#### Using the Repository Mixin for Application

A Repository Mixin is available for Application that provides convenience
methods for binding and instantiating a repository class. Bound instances can be
used anywhere in your application using Dependency Injection. The
`.repository(RepositoryClass)` function can be used to bind a repository class
to an Application. The mixin will also instantiate any repositories declared by
a component in its constructor using the `repositories` key.

Repositories will be bound to the key `repositories.RepositoryClass` where
`RepositoryClass` is the name of the Repository class being bound.

We'll use `BootMixin` on top of `RepositoryMixin` so that Repository bindings
can be taken care of automatically at boot time before the application starts.

```ts
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {db} from './datasources/db.datasource';

export class RepoApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
    this.dataSource(db);
  }
}
```

## Related resources

- <https://martinfowler.com/eaaCatalog/repository.html>
- <https://msdn.microsoft.com/en-us/library/ff649690.aspx>
- <http://docs.spring.io/spring-data/data-commons/docs/2.0.0.M3/reference/html/#repositories>

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
