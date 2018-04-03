---
lang: en
title: 'Putting it all together'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-putting-it-together.html
summary: LoopBack 4 Todo Application Tutorial - Putting it all together
---

### Putting it all together

We've got all of our artifacts now, and all that's left is to bind them to our
[Application](Application.md) so that LoopBack's
[Dependency injection](Dependency-injection.md)
system can tie it all together for us!

LoopBack's
[boot module](https://github.com/strongloop/loopback-next/tree/master/packages/boot)
will automatically discover our controllers, repositories, datasources and other
artifacts and inject them into our application for use.

> **NOTE**: The boot module will discover and inject artifacts that follow our
> established conventions for artifact directories. Here are some examples:
>
> - Controllers: `./src/controllers`
> - Datasources: `./src/datasources`
> - Models: `./src/models`
> - Repositories: `./src/repositories`
>
> To find out how to customize this behavior, see the
> [Booters](Booting-an-Application.md#booters)
> section of
> [Booting an Application](Booting-an-Application.md).

#### src/application.ts

```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication, RestServer} from '@loopback/rest';
import {MySequence} from './sequence';
import {db} from './datasources/db.datasource';

/* tslint:disable:no-unused-variable */
// Binding and Booter imports are required to infer types for BootMixin!
import {BootMixin, Booter, Binding} from '@loopback/boot';

// juggler and DataSourceConstructor imports are required to infer types for RepositoryMixin!
import {
  Class,
  Repository,
  RepositoryMixin,
  juggler,
  DataSourceConstructor,
} from '@loopback/repository';
/* tslint:enable:no-unused-variable */

export class TodoListApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.setupDatasources();
  }

  setupDatasources() {
    // This will allow you to test your application without needing to
    // use a "real" datasource!
    const datasource =
      this.options && this.options.datasource
        ? new DataSourceConstructor(this.options.datasource)
        : db;
    this.dataSource(datasource);
  }

  async start() {
    await super.start();

    const server = await this.getServer(RestServer);
    const port = await server.get<number>('rest.port');
    console.log(`Server is running at http://127.0.0.1:${port}`);
    console.log(`Try http://127.0.0.1:${port}/ping`);
  }
}
```

### Try it out

Let's try out our application! First, you'll want to start the app.

```sh
$ npm start
Server is running on port 3000
```

Next, you can use the [API Explorer](http://localhost:3000/swagger-ui) to browse
your API and make requests!

Here are some requests you can try:

- `POST /todo` with a body of `{ "title": "get the milk" }`
- `GET /todo/{id}` using the ID you received from your `POST`, and see if you
  get your Todo object back.
- `PATCH /todo/{id}` with a body of `{ "desc": "need milk for cereal" }`

That's it! You've just created your first LoopBack 4 application!

### More examples and tutorials

Eager to continue learning about LoopBack 4? Check out our
[examples and tutorials](Examples-and-tutorials.md)
section to find examples for creating your own custom components, sequences and
more!

### Navigation

Previous step: [Add a controller](todo-tutorial-controller.md)
