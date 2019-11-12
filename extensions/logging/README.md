# @loopback/extension-logging

This module contains a component provides logging facilities based on
[Winston](https://github.com/winstonjs/winston) and
[Fluentd](https://github.com/fluent/fluent-logger-node).

## Stability: :warning:Experimental:warning:

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save @loopback/extension-logging
```

## Basic use

The component should be loaded in the constructor of your custom Application
class.

Start by importing the component class:

```ts
import {LoggingComponent} from '@loopback/extension-logging';
```

In the constructor, add the component to your application:

```ts
this.component(LoggingComponent);
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
