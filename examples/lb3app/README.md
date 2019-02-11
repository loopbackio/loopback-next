# @loopback/example-lb3app

This example demonstrates how to mount your existing LoopBack 3 application in a
new LoopBack 4 project.

## Tutorial

1. Create a new LoopBack 4 project using `lb4 app`.

   ```
   $ lb4 app
   ```

2. Create a new directory `legacy` and copy your existing LoopBack 3 application
   there. You should end up with the following directory layout

   ```
   legacy/
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
   `legacy/package.json`. Typically you will need to add the following entries,
   plus any connectors or components you are using in your LB3 application.

   ```json
   {
     "compression": "^1.0.3",
     "cors": "^2.5.2",
     "helmet": "^3.15.0",
     "loopback": "^3.0.0",
     "loopback-boot": "^3.1.1",
     "loopback-connector-mysql": "^5.3.1",
     "serve-favicon": "^2.0.1",
     "strong-error-handler": "^3.2.0"
   }
   ```

4. Disable error handling in your LB3 app, leave it for the new LB4 app.

   - Remove `legacy/server/middleware.development.json`
   - Edit `legacy/server/middleware.json` and remove the following two entries:
     - `final` >> `loopback#urlNotFound`
     - `final:after` >> `strong-error-handler`
   - Remove `strong-error-handler` from `package.json` dependencies.

5. Move your front-end files from `legacy/client` to `public/` directory and
   disable static assets in your LB3 app by removing the following entry in
   `legacy/server/middleware.json`:

   - `files` >> `loopback#static`

6. Install and configure `@loopback/booter-lb3app` to boot and mount the LB3 application:

   1. `npm install --save @loopback/booter-lb3app`

   2. Import the booter at the top of your `src/application.ts` file.

      ```ts
      import {Lb3AppBooter} from '@loopback/booter-lb3app';
      ```

   3. Register the booter in Application's constructor:

      ```ts
      this.booters(Lb3AppBooter);
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
