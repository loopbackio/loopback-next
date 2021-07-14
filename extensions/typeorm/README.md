# @loopback/typeorm

This module enables TypeORM support in LoopBack. For pending features, refer to
the [Limitations](#limitations) section below.

## Overview

[TypeORM](https://typeorm.io/) is a TypeScript ORM for Node.js. It supports many
databases and can be used an as alternative to LoopBack's Juggler ORM.

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save @loopback/typeorm
```

## Basic Use

### Enabling TypeORM support

To enable TypeORM support, import `TypeOrmMixin` from `@loopback/typeorm` and
apply it to your application class as shown below.

```ts
import {BootMixin} from '@loopback/boot';
import {RestApplication} from '@loopback/rest';
import {TypeOrmMixin} from '@loopback/typeorm';
export class MyApplication extends BootMixin(TypeOrmMixin(RestApplication)) {
  ...
}
```

### Creating Connections

[Connections](https://typeorm.io/#/connection) are equivalent to LoopBack's
datasources. They contain the connectivity and other details about the
databases. Define the connection in files with a `.connection.ts` extension and
keep them in the `typeorm-connections` directory of your project.

```ts
// src/connections/sqlite.connection.ts
import path from 'path';
import {ConnectionOptions} from '@loopback/typeorm';
import {Book} from '../entities/';

export const SqliteConnection: ConnectionOptions = {
  name: 'SQLite',
  type: 'sqlite',
  database: './mydb.sql',
  entities: [Book],
  synchronize: true,
};
```

Make sure to install the underlying database driver. For example, if you are
using SQlite, you'll need to install `sqlite3`.

```sh
npm install sqlite3
```

Refer to the
[TypeORM documentation](https://github.com/typeorm/typeorm#installation) for the
supported databases and the underlying drivers.

### Creating Entities

[Entities](https://typeorm.io/#/entities) are equivalent to LoopBack's Models.
Define the entities as usual and keep them in a directory named
`typeorm-entities`.

```ts
// src/typeorm-entities/book.entity.ts
import {Entity, Column, PrimaryColumn} from 'typeorm';
@Entity()
export class Photo {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  isPublished: boolean;
}
```

### Creating Controllers

Controllers continue to work as usual. And you don't have to create repositories
since TypeORM creates them for you; just inject them in the controllers. The
repository API is 100% TypeORM
[repository API](https://typeorm.io/#/repository-api).

```ts
// src/controllers/book.controller.ts
import {get, post, Request, requestBody} from '@loopback/rest';
import {getModelSchema, Repository, typeorm} from '@loopback/typeorm';
import {Book} from '../typeorm-entities';

export class BookController {
  @typeorm.repository(Book) private bookRepo: Repository<Book>;

  constructor() {}

  // Create a new book
  @post('/book')
  async create(@requestBody() data: Book) {
    const book = new Book();
    book.title = data.title;
    book.published = false;
    return await this.bookRepo.save(book);
  }

  // Find book by title
  @get('/note/{title}')
  async findByTitle(@param.path.string('title') title: string) {
    return await this.bookRepo.find({title});
  }
}
```

## Limitations

Please note, the current implementation does not support the following:

1. [Complete TypeORM to OpenAPI data type conversion](https://github.com/loopbackio/loopback-next/issues/5893)
   (currently only `number`, `string`, and `boolean` are supported)
2. [Full JSON/OpenAPI schema for entities](https://github.com/loopbackio/loopback-next/issues/5894),
   including variants like with/without id, with/without relations, partial,
   etc.
3. [Support for LoopBack-style filters](https://github.com/loopbackio/loopback-next/issues/5895)
4. [JSON/OpenAPI schema to describe the supported filter format](https://github.com/loopbackio/loopback-next/issues/5896)
5. [Custom repository classes](https://github.com/loopbackio/loopback-next/issues/5897)
   (e.g. to implement bookRepo.findByTitle(title)).
6. [Database migration](https://github.com/loopbackio/loopback-next/issues/5898)

Community contribution is welcome.

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
