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

The component contributes bindings with keys listed below:

- LoggingBindings.FLUENT_SENDER - A fluent sender
- LoggingBindings.WINSTON_LOGGER - A winston logger
- LoggingBindings.WINSTON_TRANSPORT_FLUENT - A fluent transport for winston

The fluent sender and transport for winston can be configured against
`LoggingBindings.FLUENT_SENDER`:

```ts
import {LoggingBindings} from '@loopback/extension-logging';

app.configure(LoggingBindings.FLUENT_SENDER).to({
  host: process.env.FLUENTD_SERVICE_HOST || 'localhost',
  port: +(process.env.FLUENTD_SERVICE_PORT_TCP || 0) || 24224,
  timeout: 3.0,
  reconnectInterval: 600000, // 10 minutes
});
```

The winston logger can be configured against `LoggingBindings.WINSTON_LOGGER`:

```ts
import {LoggingBindings} from '@loopback/extension-logging';

ctx.configure<LoggerOptions>(LoggingBindings.WINSTON_LOGGER).to({
  level: 'info',
  format: format.json(),
  defaultMeta: {framework: 'LoopBack'},
});
```

The winston logger accepts two types of extensions to the following extension
points:

- WINSTON_TRANSPORT = 'logging.winston.transport'
- WINSTON_FORMAT = 'logging.winston.format'

```ts
import {extensionFor} from '@loopback/core';
import {format} from 'winston';
import {WINSTON_FORMAT, WINSTON_TRANSPORT} from '@loopback/extension-logging';

const myFormat: Format = ...;

ctx
  .bind('logging.winston.formats.myFormat')
  .to(myFormat)
  .apply(extensionFor(WINSTON_FORMAT));
ctx
  .bind('logging.winston.formats.colorize')
  .to(format.colorize())
  .apply(extensionFor(WINSTON_FORMAT));
```

## Start fluentd as a Docker container for testing

For mocha tests, we use
[testcontainers](https://github.com/testcontainers/testcontainers-node) to
start/stop the fluentd docker container automatically.

There are also scripts in `fixtures` directory:

- start-fluentd.sh
- stop-fluentd.sh

The fluentd configuration is read from `fixtures/etc/fluentd.conf`.

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
