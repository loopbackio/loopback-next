# @loopback/example-lb3-application

This example demonstrates how to mount your existing LoopBack 3 application in a
new LoopBack 4 project.

## Tutorial

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

## Try it out

Start the new LB4 application

    ```sh
    $ npm start
    Server is running at http://127.0.0.1:3000
    ```

Open the URL printed to console to view your front-end served from `public`
directory or go to `http://127.0.0.1:3000/explorer` to explore the REST API.

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
