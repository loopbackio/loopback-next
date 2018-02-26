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
import {RestApplication} from '@loopback/rest';

/* tslint:disable:no-unused-variable */
// Do not remove!
// Class and Repository imports required to infer types in consuming code!
// Binding and Booter imports are required to infer types for BootMixin!
import {BootMixin, Booter, Binding} from '@loopback/boot';
import {
  Class,
  Repository,
  RepositoryMixin,
} from '@loopback/repository';
/* tslint:enable:no-unused-variable */
export class TodoApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);
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
}
```

Once you're ready, we'll move on to the [Add your Todo model](model.md)
section.

For more information on the Legacy Juggler, check out the
[@loopback/repository package](https://github.com/strongloop/loopback-next/tree/master/packages/repository)
or see the [Repositories section](http://loopback.io/doc/en/lb4/Repositories.html)
of our docs.

### Navigation

Previous step: [Scaffolding your application](scaffolding.md)

Next step: [Add your Todo model](model.md)
