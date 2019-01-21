# @loopback/example-lb3models

This project demonstrates how to add LoopBack 3 models into a LoopBack 4
application.

## Instructions

1. Create a new LB4 app using `lb4 app`. Add `@loopback/v3compat'` to project
   dependencies.

2. Copy your model files from `common/models` to `legacy/models` directory, for
   example:

   ```text
   legacy/models/coffee-shop.js
   legacy/models/coffee-shop.json
   ```

   IMPORTANT! These files must live outside your `src` directory, out of sight
   of TypeScript compiler.

3. Copy your `server/model-config` to `src/legacy/model-config.json`.

   Remove references to LoopBack 3 built-in models like User and ACL. LoopBack 4
   does not support local authentication yet.

   Remove `_meta` section, LoopBack 4 does not support this config option.

4. Modify your Application class and apply `CompatMixin`.

   ```ts
   import {CompatMixin} from '@loopback/v3compat';
   // ...

   export class TodoListApplication extends CompatMixin(
     BootMixin(ServiceMixin(RepositoryMixin(RestApplication))),
   ) {
     // ...
   }
   ```

5. Edit your boot configuration in `src/application.ts` and add the following
   section:

   ```ts
   {
     v3compat: {
        // from "/dist/src/application.ts" to "/legacy"
       root: '../../legacy',
     },
   }
   ```

6. Register your legacy datasources in Application's constructor.

   ```ts
   this.v3compat.dataSource('mysqlDs', {
     name: 'mysqlDs',
     connector: 'mysql',
     host: 'demo.strongloop.com',
     port: 3306,
     database: 'getting_started',
     username: 'demo',
     password: 'L00pBack',
   });
   ```

## Need help?

Check out our [Gitter channel](https://gitter.im/strongloop/loopback) and ask
for help with this tutorial.

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
