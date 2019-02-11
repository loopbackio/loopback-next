# @loopback/booter-lb3app

Boot LoopBack 3 application and expose its REST API via LoopBack 4.

## Installation

```sh
npm install --save @loopback/booter-lb3app
```

## Basic use

Import the booter at the top of your `src/application.ts` file.

```ts
import {Lb3AppBooter} from '@loopback/booter-lb3app';
```

Register the booter in Application's constructor:

```ts
this.booters(Lb3AppBooter);
```

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
