# @loopback/example-lb3-application

This example demonstrates how to mount your existing LoopBack 3 (LB3)
application on a new LoopBack 4 (LB4) project and how to move the middleware
from the LB3 application to a common location so that both the LB3 and LB4
applications can use them.

## Mounting LB3 app on LB4 app

1. Create a new LoopBack 4 project using `lb4 app`.

   ```
   $ lb4 app
   ```

   Fill out the prompts as they fit your project and leave all features enabled.

2. Create a new directory `lb3app` from the root of your LoopBack 4 application
   and copy your existing LoopBack 3 application there. You should end up with
   the following directory layout:

   ```
   lb3app/
     # LoopBack 3 application in JavaScript
     common/
       models/
         # LB3 model files
     server/
       boot/
         # LB3 boot scripts
   public/
     # front-end assets (LB4 way)
   src/
     # LoopBack 4 application in TypeScript
   ```

3. Move LB3 dependencies to the main package.json file and remove
   `lb3app/package.json`, `lb3app/node_modules/`, and`lb3app/package-lock.json`,
   if it exists. Typically you will need to add the following entries, plus any
   connectors or components you are using in your LB3 application.

   ```json
   {
     "compression": "^1.7.4",
     "cors": "^2.8.5",
     "helmet": "^3.16.0",
     "loopback": "^3.25.1",
     "loopback-boot": "^3.3.0"
   }
   ```

   Note: make sure to use `loopback-boot@3.2.1` or higher.

   Run `npm install` from the root of your LB4 project to install the LB3
   dependencies.

4. Disable error handling in your LB3 app, leave it for the new LB4 app.

   - Remove `lb3app/server/middleware.development.json`
   - Edit `lb3app/server/middleware.json` and remove the following two entries:
     - `final` >> `loopback#urlNotFound`
     - `final:after` >> `strong-error-handler`
   - Remove `strong-error-handler` from `package.json` dependencies.
   - In `lb3app/server/config.json`, if `"handleErrors": false` is in
     `remoting`, move it to `rest`.

5. Move your front-end files from `lb3app/client` to `public/` directory and
   disable static assets in your LB3 app by removing the following entry in
   `lb3app/server/middleware.json`:

   - `files` >> `loopback#static`

   Also remove `lb3app/server/boot/root.js`, since the main page will be served
   by the LoopBack 4 project.

6. Remove `lb3app/server/component-config.json` to disable LoopBack 3's
   explorer. The LoopBack 4 explorer will be used instead.

7. Install and configure `@loopback/booter-lb3app` to boot and mount the LB3
   application:

   1. `npm install --save @loopback/booter-lb3app`

   2. Import the component at the top of your `src/application.ts` file.

      ```ts
      import {Lb3AppBooterComponent} from '@loopback/booter-lb3app';
      ```

   3. Register the component in Application's constructor:

      ```ts
      this.component(Lb3AppBooterComponent);
      ```

Start the new LB4 application

```sh
$ npm start
Server is running at http://127.0.0.1:3000
```

Open the URL printed to console to view your front-end served from `public`
directory or go to `http://127.0.0.1:3000/explorer` to explore the REST API.

The LB3 application is now successfully mounted on a LB4 application, but we can
further optimize the setup so that only the bare neccessary artifacts from the
LoopBack 3 application remain. This includes moving almost all of the middleware
to a common location so that they are shared by both the LoopBack 3 and the
LoopBack 4 apps.

## Migrating Express middleware from LB3 app

1. Update config.json

   First off, edit the LB3 app's `config.json` file.

   Remove these properties, as they are not required anymore:

   ```json
   "host": "0.0.0.0",
   "port": 3000,
   ```

   Change `restApiRoot` to `/` or any path where you would like the LB3 app to
   be mounted; that's relative to the LB4 app's REST API path, which defaults to
   `/api`.

   And then add `"handleUnknownPaths": false` to the `rest` property, this will
   prevent the LB3 REST api from sending a 404 response for requests it cannot
   handle.

   The `config.json` file should now look like this:

   ```json
   {
     "restApiRoot": "/",
     "remoting": {
       "context": false,
       "rest": {
         "handleErrors": false,
         "handleUnknownPaths": false,
         "normalizeHttpPath": false,
         "xml": false
       },
       "json": {
         "strict": false,
         "limit": "100kb"
       },
       "urlencoded": {
         "extended": true,
         "limit": "100kb"
       },
       "cors": false
     }
   }
   ```

2. Configure the base Express app

   We will be using a base Express app (`src/server.ts`) for mounting the LB4
   app as described in
   "[Creating an Express Application with LoopBack REST API](https://loopback.io/doc/en/lb4/express-with-lb4-rest-tutorial.html)"
   guide.

   Migrate the LB3 app's middleware from its `middleware.json` file to this
   Express app, except the one from the `routes` phase (there is a
   [pending task](https://github.com/strongloop/loopback-next/issues/4181) to
   complete the support for this middleware).

   Each root property in the `middleware.json` object represents a middleware
   phase, extract the relevant middleware and load them in the Express app in
   order.

   An entry like `"compression": {}` translates to `compression()`, and
   `loopback#favicon` translates to `loopback.favicon()` in TypeScript. For more
   details about `middleware.json`, refer to
   [its documentation](https://loopback.io/doc/en/lb3/middleware.json.html).

   The `middleware.json` file should look like this now:

   ```js
   {
    "routes": {
      "loopback#rest": {
        "paths": [
          "${restApiRoot}"
        ]
      }
    }
   }
   ```

   The middleware mounted in the Express app will be shared by both LB3 and LB4
   apps.

   Move any static files from the LB3 app to the `public` directory of the
   Express app. Move any non-REST routes defined anywhere in the LB3 app to the
   Express app.

   This is what the `src/server.ts` file will look like:

   ```ts
   import {ApplicationConfig} from '@loopback/core';
   import {once} from 'events';
   import express, {Request, Response} from 'express';
   import * as http from 'http';
   import {AddressInfo} from 'net';
   import * as path from 'path';
   // Replace CoffeeShopApplication with the name of your application
   import {CoffeeShopApplication} from './application';

   const loopback = require('loopback');
   const compression = require('compression');
   const cors = require('cors');
   const helmet = require('helmet');

   export class ExpressServer {
     private app: express.Application;
     public readonly lbApp: CoffeeShopApplication;
     public server?: http.Server;
     public url: String;

     constructor(options: ApplicationConfig = {}) {
       this.app = express();
       this.lbApp = new CoffeeShopApplication(options);

       // Middleware migrated from LoopBack 3
       this.app.use(loopback.favicon());
       this.app.use(compression());
       this.app.use(cors());
       this.app.use(helmet());

       // Mount the LB4 REST API
       this.app.use('/api', this.lbApp.requestHandler);

       // Custom Express routes
       this.app.get('/ping', function (_req: Request, res: Response) {
         res.send('pong');
       });

       // Serve static files in the public folder
       this.app.use(express.static(path.join(__dirname, '../public')));
     }

     public async boot() {
       await this.lbApp.boot();
     }

     public async start() {
       await this.lbApp.start();
       const port = this.lbApp.restServer.config.port || 3000;
       const host = this.lbApp.restServer.config.host || '127.0.0.1';
       this.server = this.app.listen(port, host);
       await once(this.server, 'listening');
       const add = <AddressInfo>this.server.address();
       this.url = `http://${add.address}:${add.port}`;
     }

     public async stop() {
       if (!this.server) return;
       await this.lbApp.stop();
       this.server.close();
       await once(this.server, 'close');
       this.server = undefined;
     }
   }
   ```

3. Update `src/index.ts`

   The Express app will replace the `CoffeeShopApplication` as the entry point
   for the program, modify the `src/index.ts` file accordingly.

   ```ts
   import {ApplicationConfig} from '@loopback/core';
   import {ExpressServer} from './server';

   export {ApplicationConfig, ExpressServer};

   export async function main(options: ApplicationConfig = {}) {
     const server = new ExpressServer(options);
     await server.boot();
     await server.start();
     console.log(`Server is running at ${server.url}`);
   }
   ```

4. Next, modify the application config in `src/index.ts` file to prevent the LB4
   app from listening, by adding `listenOnStart: false` in `config.rest` object.
   The `config` object should now look like this:

   ```ts
   const config = {
     rest: {
       port: +(process.env.PORT ?? 3000),
       host: process.env.HOST ?? 'localhost',
       openApiSpec: {
         // useful when used with OpenAPI-to-GraphQL to locate your application
         setServersFromRequest: true,
       },
       listenOnStart: false,
     },
   };
   ```

   Then, in the `bootOptions` of the `CoffeeShopApplication` class, add the
   `lb3app` to configure the path of the LB3 APIs.

   ```js
   lb3app: {
     mode: 'fullApp';
   }
   ```

   `this.bootOptions` should now look like this:

   ```ts
   this.bootOptions = {
     controllers: {
       // Customize ControllerBooter Conventions here
       dirs: ['controllers'],
       extensions: ['.controller.js'],
       nested: true,
     },
     lb3app: {
       mode: 'fullApp',
     },
   };
   ```

Start the app:

```sh
$ npm start
```

Load [http://localhost:3000/](http://localhost:3000/) on your browser. This will
load the Express app, with mounted LB3 and LB4 applications.

## Running LB3 tests from LB4

You can run tests in an LoopBack 3 application from the LoopBack 4 application
it mounted on with command `npm test`.

We want the LoopBack 3 tests to use the LoopBack 4 server rather than the
LoopBack 3 application. The following guide shows how to run

- acceptance-level tests making HTTP calls to invoke application logic. e.g.
  `POST /users/login`
- integration-level tests that are using JS API to call application logic. e.g.
  `MyModel.create()`

### Adding LB3 Test Path in Command

In order to run LoopBack 3's tests from their current folder, add LB3 tests'
path to `test` entry in package.json:

- `"test": "lb-mocha \"dist/**tests**/*_/_.js\" \"lb3app/test/*.js\""`

In this case, the test folder is
[`/lb3app/test`](https://github.com/strongloop/loopback-next/tree/spike/lb3test/examples/lb3-application/lb3app/test)
from the root of the LoopBack 4 project.

This will run LoopBack 4 tests first then LoopBack 3 tests.

_To emphasize the setup steps and separate them from the test case details, all
the comprehensive test code are extracted into function `runTests`._

### Running Acceptance Tests

First, move any LoopBack 3 test dependencies to `package.json`'s devDependencies
and run:

```sh
npm install
```

In your test file:

1. When launch the Express server

- 1.1 Update to use the Express server when doing requests:

  ```ts
  // can use lb4's testlab's supertest as the dependency is already installed
  const {supertest} = require('@loopback/testlab');
  const assert = require('assert');
  const should = require('should');
  const {ExpressServer} = require('../../dist/server');

  let app;

  function jsonForExpressApp(verb, url) {
    // use the express server, it mounts LoopBack 3 apis to
    // base path '/api'
    return supertest(app.server)
      [verb]('/api' + url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
  }
  ```

- 1.2 Boot and start the Express app in your before hook, and stop the app in
  the after hook:

  ```ts
  describe('LoopBack 3 style tests - Launch Express server', function () {
    before(async function () {
      app = new ExpressServer();
      await app.boot();
      await app.start();
    });

    after(async () => {
      await app.stop();
    });

    // your tests here
    runTests();
  });
  ```

2. When launch the LoopBack 4 application

- 2.1 Update to use the LoopBack 4 server when doing requests:

  ```ts
  // can use lb4's testlab's supertest as the dependency is already installed
  const {supertest} = require('@loopback/testlab');
  const assert = require('assert');
  const should = require('should');
  const {CoffeeShopApplication} = require('../../dist/application');

  let app;

  function jsonForLB4(verb, url) {
    // use the lb4 app's rest server
    return supertest(app.restServer.url)
      [verb](url)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/);
  }
  ```

- 2.2 Boot and start the LoopBack 4 app in your before hook, and stop the app in
  the after hook:

  ```ts
  describe('LoopBack 3 style tests - launch LB4 app', function () {
    before(async function () {
      app = new CoffeeShopApplication();
      await app.boot();
      await app.start();
    });

    after(async () => {
      await app.stop();
    });

    // your tests here
    runTests();
  });
  ```

Example of this use can be seen in
[`test/acceptance.js`](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application/lb3app/test/acceptance.js)
which has the same tests as
[`src/__tests__/acceptance/lb3app.acceptance.ts`](https://github.com/strongloop/loopback-next/blob/spike/lb3test/examples/lb3-application/src/__tests__/acceptance/lb3app.acceptance.ts),
but in LB3 style. And
[`test/authentication.js`](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application/lb3app/test/authentication.js)

Now when you run `npm test` your LoopBack 3 tests should be run along with any
LoopBack 4 tests you have.

Optional: Another option is to migrate your tests to use LoopBack 4 style of
testing, similar to `src/__tests__/acceptance/lb3app.acceptance.ts`.
Documentation for LoopBack testing can be found in
https://loopback.io/doc/en/lb4/Testing-your-application.html.

## Running Integration Tests

For the integration tests, LoopBack 3 models were bound to the LoopBack 4
application in order to allow JavaScript API to call application logic such as
`Model.create()`. This can be seen in
[`packages/booter-lb3app/src/lb3app.booter.ts`](https://github.com/strongloop/loopback-next/blob/spike/lb3test/packages/booter-lb3app/src/lb3app.booter.ts#L76-L85).

In order to retrieve the model from the application's context, `get()` can be
used as follows:

```ts
describe('LoopBack 3 style integration tests', function () {
  let app;
  let CoffeeShop;

  before(async function () {
    // If launch the LoopBack 4 application
    // app = new CoffeeShopApplication();
    app = new ExpressServer();
    await app.boot();
    await app.start();
  });

  before(() => {
    // follow the syntax: lb3-models.{ModelName}
    // If launch the LoopBack 4 application
    // CoffeeShop = await app.get('lb3-models.CoffeeShop');
    CoffeeShop = await app.lbApp.get('lb3-models.CoffeeShop');
  });

  after(async () => {
    await app.stop();
  });

  // your tests here
  runTests();
});
```

The syntax for LB3 model's binding key is `lb3-models.{model name}`.

Additionally, LB3 datasources are also bound to the LB4 application's context
and can be retrieved with a key in the syntax `lb3-datasources.{ds name}`.

Example integration tests can be found in
[`examples/lb3-application/lb3app/test/integration.js`](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application/lb3app/test/integration.js).

Example authentication tests can be found in
[`examples/lb3-application/lb3app/test/authentication.js`](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application/lb3app/test/authentication.js).

## Need help?

Check out our
[Slack](https://join.slack.com/t/loopbackio/shared_invite/zt-8lbow73r-SKAKz61Vdao~_rGf91pcsw)
and ask for help with this tutorial.

## Bugs/Feedback

Open an issue in [loopback-next](https://github.com/strongloop/loopback-next)
and we'll take a look.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
