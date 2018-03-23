### Adding the Legacy Juggler

The Legacy Juggler is a "bridge" between the existing
[loopback-datasource-juggler](https://github.com/strongloop/loopback-datasource-juggler)
and the new LoopBack 4 architecture. It provides the capabilities required to
access persistence layers/APIs, and perform
[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations
on those sources of data.

It also provides many of the functions and interfaces we'll require for setting
up our new LoopBack application, which is why we're starting here.

Now that you have your setup, it's time to modify it to add in
`@loopback/repository`. Install this dependency by running
`npm i --save @loopback/repository`.

Next, modify `src/application.ts` to change the base class of your app to use
the `RepositoryMixin`:

#### src/application.ts

```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication, RestServer} from '@loopback/rest';
import {MySequence} from './sequence';

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

Once you're ready, we'll move on to the [Add your Todo model](model.md) section.

For more information on the Legacy Juggler, check out the
[@loopback/repository package](https://github.com/strongloop/loopback-next/tree/master/packages/repository)
or see the
[Repositories section](http://loopback.io/doc/en/lb4/Repositories.html) of our
docs.

### Navigation

Previous step: [Scaffolding your application](scaffolding.md)

Next step: [Add your Todo model](model.md)
