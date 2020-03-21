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
   import * as express from 'express';
   import {Request, Response} from 'express';
   import * as http from 'http';
   import pEvent from 'p-event';
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
     private server?: http.Server;

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
       await pEvent(this.server, 'listening');
     }

     public async stop() {
       if (!this.server) return;
       await this.lbApp.stop();
       this.server.close();
       await pEvent(this.server, 'close');
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

   export {ExpressServer};

   export async function main(options: ApplicationConfig = {}) {
     const server = new ExpressServer(options);
     await server.boot();
     await server.start();
     console.log(`Server is running at ${server.url}`);
   }
   ```

4. Update `index.js`

   Next, modify the `index.js` file in the root of the project to prevent the
   LB4 app from listening, by adding `listenOnStart: false` in `config.rest`
   object. The `config` object should now look like this:

   ```js
   const config = {
     rest: {
       port: +process.env.PORT || 3000,
       host: process.env.HOST || 'localhost',
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

### Need help?

Check out our [Gitter channel](https://gitter.im/strongloop/loopback) and ask
for help with this tutorial.

### Bugs/Feedback

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
