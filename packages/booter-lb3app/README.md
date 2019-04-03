# @loopback/booter-lb3app

Boot a LoopBack 3 application and expose its REST API via LoopBack 4.

## Overview

The `@loopback/booter-lb3app` package provides a way for LoopBack 3 developers
to boot their LoopBack 3 application, convert the application's Swagger spec
into OpenAPI v3, and then mount the application, including its spec, onto a
target LoopBack 4 application.

## Installation

```sh
npm install --save @loopback/booter-lb3app
```

## Basic use

Import the component at the top of your `src/application.ts` file.

```ts
import {Lb3AppBooterComponent} from '@loopback/booter-lb3app';
```

Register the component in Application's constructor:

```ts
this.component(Lb3AppBooterComponent);
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
