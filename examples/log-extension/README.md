# @loopback/example-log-extension

An example repo showing how to write a complex log extension for LoopBack 4

## Overview

This repository shows you how to use
[@loopback/cli](https://github.com/strongloop/loopback-next/tree/master/packages/cli)
to write a complex logging extension that requires a
[Component](http://loopback.io/doc/en/lb4/Using-components.html),
[Decorator](http://loopback.io/doc/en/lb4/Decorators.html), and a
[Mixin](http://loopback.io/doc/en/lb4/Mixin.html).

To use this extension you can add the `LogMixin` to your Application which will
provide you a function to set the Application wide log level as well as
automatically load the `LogComponent`. Only Controller methods configured at or
above the logLevel will be logged.

_You may alternatively load `LogComponent` yourself and set the log level using
the appropriate binding keys manually if you don't wish to use the `LogMixin`._

Possible levels are: DEBUG &lt; INFO &lt; WARN &lt; ERROR &lt; OFF

_Possible levels are represented as numbers but users can use
`LOG_LEVEL.${level}` to specify the value instead of using numbers._

A decorator enables you to set the log level for Controller methods, at or above
which it should be logged.

### Example Usage

```ts
import {LogMixin, LOG_LEVEL, log} from 'loopback4-example-log-extension';
// Other imports ...

class LogApp extends LogMixin(BootMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);

    this.projectRoot = __dirname;
    this.logLevel(LOG_LEVEL.ERROR);
  }
}

class MyController {
  @log(LOG_LEVEL.WARN)
  @get('/')
  hello() {
    return 'Hello LoopBack';
  }

  @log(LOG_LEVEL.ERROR)
  @get('/name')
  helloName() {
    return 'Hello Name';
  }
}
```

## Cloning the example project locally

You can obtain a local clone of this project (without the rest of our monorepo)
using the following command:

```sh
lb4 example log-extension
```

## Tutorial

Install `@loopback/cli` by running `npm i -g @loopback/cli`.

Initialize your new extension project as follows: `lb4 extension`

- Project name: `loopback4-example-log-extension`
- Project description: `An example extension project for LoopBack 4`
- Project root directory: `(loopback4-example-log-extension)`
- Component class name: `LogComponent`
- Select features to enable in the project': `eslint`, `prettier`, `mocha`,
  `loopbackBuild`

Now you can write the extension as follows:

### `/src/keys.ts`

Define `Binding` keys here for the component as well as any constants for the
user (for this extension that'll be the logLevel `enum`).

```ts
/**
 * Binding keys used by this component.
 */
export namespace EXAMPLE_LOG_BINDINGS {
  export const APP_LOG_LEVEL = BindingKey.create<LOG_LEVEL>(
    'example.log.level',
  );
  export const TIMER = BindingKey.create<TimerFn>('example.log.timer');
  export const LOGGER = BindingKey.create<LogWriterFn>('example.log.logger');
  export const LOG_ACTION = BindingKey.create<LogFn>('example.log.action');
}

/**
 * Enum to define the supported log levels
 */
export enum LOG_LEVEL {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  OFF,
}
```

### `src/types.ts`

Before we continue, we will need to install a new dependecy as follows:

```shell
npm i @loopback/rest
```

Now we define TypeScript type definitions / interfaces for complex types and
functions here.

```ts
import {Request, OperationArgs} from '@loopback/rest';

/**
 * A function to perform REST req/res logging action
 */
export interface LogFn {
  (
    req: Request,
    args: OperationArgs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any,
    startTime?: HighResTime,
  ): Promise<void>;

  startTimer(): HighResTime;
}

/**
 * Log level metadata
 */
export type LevelMetadata = {level: number};

/**
 * High resolution time as [seconds, nanoseconds]. Used by process.hrtime().
 */
export type HighResTime = [number, number]; // [seconds, nanoseconds]

/**
 * Log writing function
 */
export type LogWriterFn = (msg: string, level: number) => void;

/**
 * Timer function for logging
 */
export type TimerFn = (start?: HighResTime) => HighResTime;
```

### `src/decorators/log.decorator.ts`

Extension developers can create decorators to provide "hints" (or metadata) to
user artifacts such as controllers and their methods. These "hints" allow the
extension to add extra processing accordingly.

For this extension, the decorator marks which controller methods should be
logged (and optionally at which level they should be logged). We leverage
`@loopback/metadata` module to implement the decorator and inspection function.

```ts
import {LOG_LEVEL, EXAMPLE_LOG_BINDINGS} from '../keys';
import {
  Constructor,
  MethodDecoratorFactory,
  MetadataInspector,
} from '@loopback/context';
import {LevelMetadata} from '../types';

/**
 * Mark a controller method as requiring logging (input, output & timing)
 * if it is set at or greater than Application LogLevel.
 * LOG_LEVEL.DEBUG < LOG_LEVEL.INFO < LOG_LEVEL.WARN < LOG_LEVEL.ERROR < LOG_LEVEL.OFF
 *
 * @param level - The Log Level at or above it should log
 */
export function log(level?: number) {
  if (level === undefined) level = LOG_LEVEL.WARN;
  return MethodDecoratorFactory.createDecorator<LevelMetadata>(
    EXAMPLE_LOG_BINDINGS.METADATA,
    {
      level,
    },
  );
}

/**
 * Fetch log level stored by `@log` decorator.
 *
 * @param controllerClass - Target controller
 * @param methodName - Target method
 */
export function getLogMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): LevelMetadata {
  return (
    MetadataInspector.getMethodMetadata<LevelMetadata>(
      EXAMPLE_LOG_BINDINGS.METADATA,
      controllerClass.prototype,
      methodName,
    ) || {level: LOG_LEVEL.OFF}
  );
}
```

### `src/mixins/log-level.mixin.ts`

Extension users must set an app wide log level at or above which the decorated
controller methods will be logged. A user can do so by binding the level to
`example.log.level` but this can be a hassle.

A mixin makes it easier for the user to set the application wide log level by
providing it via `ApplicationOptions` or using a helper method
`app.logLevel(level: number)`.

```ts
import {Constructor} from '@loopback/context';
import {EXAMPLE_LOG_BINDINGS} from '../keys';
import {LogComponent} from '../component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LogMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      if (this.options && this.options.logLevel) {
        this.logLevel(this.options.logLevel);
      }
      this.component(LogComponent);
    }

    logLevel(level: LOG_LEVEL) {
      this.bind(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL).to(level);
    }
  };
}
```

### Providers

A Providers is a class that returns a `value()` function that can be invoked by
LoopBack 4.

### `src/providers/timer.provider.ts`

A timer than can be used to time the function that is being logged.

```ts
import {Provider} from '@loopback/context';
import {TimerFn, HighResTime} from '../types';

export class TimerProvider implements Provider<TimerFn> {
  constructor() {}
  value(): TimerFn {
    return (start?: HighResTime): HighResTime => {
      if (!start) return process.hrtime();
      return process.hrtime(start);
    };
  }
}
```

### `src/providers/log-action.provider.ts`

This will be the most important provider for the extension as it is responsible
for actually logging the request. The extension will retrieve the metadata
stored by the `@log()` decorator using the controller and method name. Since
bindings are resolved at runtime and these values change with each request,
`inject.getter()` must be used to get a function capable of resolving the value
when called. The action provider will look as follows:

```ts
import {inject, Provider, Constructor, Getter} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {OperationArgs, Request} from '@loopback/rest';
import {getLogMetadata} from '../decorators/log.decorator';
import {EXAMPLE_LOG_BINDINGS, LOG_LEVEL} from '../keys';
import {
  LogFn,
  TimerFn,
  HighResTime,
  LevelMetadata,
  LogWriterFn,
} from '../types';
import chalk from 'chalk';

export class LogActionProvider implements Provider<LogFn> {
  // LogWriteFn is an optional dependency and it falls back to `logToConsole`
  @inject(EXAMPLE_LOG_BINDINGS.LOGGER, {optional: true})
  private logWriter: LogWriterFn = logToConsole;

  @inject(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL, {optional: true})
  private logLevel: number = LOG_LEVEL.WARN;

  constructor(
    @inject.getter(CoreBindings.CONTROLLER_CLASS)
    private readonly getController: Getter<Constructor<{}>>,
    @inject.getter(CoreBindings.CONTROLLER_METHOD_NAME)
    private readonly getMethod: Getter<string>,
    @inject(EXAMPLE_LOG_BINDINGS.TIMER) public timer: TimerFn,
  ) {}

  value(): LogFn {
    const fn = <LogFn>((
      req: Request,
      args: OperationArgs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result: any,
      start?: HighResTime,
    ) => {
      return this.action(req, args, result, start);
    });

    fn.startTimer = () => {
      return this.timer();
    };

    return fn;
  }

  private async action(
    req: Request,
    args: OperationArgs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any,
    start?: HighResTime,
  ): Promise<void> {
    const controllerClass = await this.getController();
    const methodName: string = await this.getMethod();

    const metadata: LevelMetadata = getLogMetadata(controllerClass, methodName);
    const level: number | undefined = metadata ? metadata.level : undefined;

    if (
      level !== undefined &&
      this.logLevel !== LOG_LEVEL.OFF &&
      level >= this.logLevel &&
      level !== LOG_LEVEL.OFF
    ) {
      if (!args) args = [];
      let msg = `${req.url} :: ${controllerClass.name}.`;
      msg += `${methodName}(${args.join(', ')}) => `;

      if (typeof result === 'object') msg += JSON.stringify(result);
      else msg += result;

      if (start) {
        const timeDiff: HighResTime = this.timer(start);
        const time: number =
          timeDiff[0] * 1000 + Math.round(timeDiff[1] * 1e-4) / 100;
        msg = `${time}ms: ${msg}`;
      }

      this.logWriter(msg, level);
    }
  }
}

function logToConsole(msg: string, level: number) {
  let output;
  switch (level) {
    case LOG_LEVEL.DEBUG:
      output = chalk.white(`DEBUG: ${msg}`);
      break;
    case LOG_LEVEL.INFO:
      output = chalk.green(`INFO: ${msg}`);
      break;
    case LOG_LEVEL.WARN:
      output = chalk.yellow(`WARN: ${msg}`);
      break;
    case LOG_LEVEL.ERROR:
      output = chalk.red(`ERROR: ${msg}`);
      break;
  }
  if (output) console.log(output);
}
```

### `src/index.ts`

Export all the files to ensure a user can import the necessary components.

```ts
export * from './decorators/log.decorator';
export * from './mixins/log-level.mixin';
export * from './providers/log-action.provider';
export * from './providers/timer.provider';
export * from './component';
export * from './types';
export * from './keys';
```

### `src/component.ts`

Package the providers in the component to their appropriate `Binding` keys so
they are automatically bound when a user adds the component to their
application.

```ts
import {Component, ProviderMap} from '@loopback/core';
import {EXAMPLE_LOG_BINDINGS} from './keys';
import {LogActionProvider} from './providers/log-action.provider';
import {TimerProvider} from './providers/timer.provider';

export class LogComponent implements Component {
  providers?: ProviderMap = {
    [EXAMPLE_LOG_BINDINGS.TIMER.key]: TimerProvider,
    [EXAMPLE_LOG_BINDINGS.LOG_ACTION.key]: LogActionProvider,
  };
}
```

## Testing

Tests should be written to ensure the behaviour implemented is correct and
future modifications don't break this expected behavior _(unless it's
intentional in which case the tests should be updated as well)_.

Take a look at the test folder to see the variety of tests written for this
extension. There are unit tests to test functionality of individual functions as
well as an extension acceptance test which tests the entire extension as a whole
(everything working together).

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
