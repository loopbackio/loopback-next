### Adding the Legacy Juggler

Jump into the directory for your new application. You'll see a folder structure
similar to this:
```
dist\
node_modules\
src\
  controllers\
    ping.controller.ts
    README.md
  repositories\
    README.md
  application.ts
  index.ts
test\
  mocha.opts
  ping.controller.test.ts
  README.md
index.js
index.d.ts
index.ts
```

The application template comes with a controller, and some default wireup in
`src/application.ts` that handles the basic configuration for your application.
For this tutorial, we won't need `ping.controller.ts` or its corresponding test,
but you can leave them in for now.

Now that you have your setup, it's time to modify it to add in
`@loopback/repository`. Install this dependency by running
`npm i --save @loopback/repository`.

Next, modify `src/application.ts` to change the base class of your app to use
the `RepositoryMixin`:

#### src/application.ts
```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {PingController} from './controllers/ping-controller';
import {Class, Repository, RepositoryMixin} from '@loopback/repository';

export class TodoApplication extends RepositoryMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.setupControllers();
  }

  setupControllers() {
    this.controller(PingController);
  }
}
```
### Navigation

Previous step: [Scaffolding your application](2-scaffold-app)

Next step: [Add your Todo model](4-todo-model)
