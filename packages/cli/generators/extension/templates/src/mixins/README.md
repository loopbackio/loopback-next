# Mixins

This directory contains source files for the mixins exported by this extension.

## Overview

Sometimes it's helpful to write partial classes and then combining them together
to build more powerful classes. This pattern is called Mixins (mixing in partial
classes) and is supported by LoopBack 4.

LoopBack 4 supports mixins at an `Application` level. Your partial class can
then be mixed into the `Application` class. A mixin class can modify or override
existing methods of the class or add new ones! It is also possible to mixin
multiple classes together as needed.

### High level example

```ts
class MyApplication extends MyMixinClass(Application) {
  // Your code
}

// Multiple Classes mixed together
class MyApp extends MyMixinClass(MyMixinClass2(Application)) {
  // Your code
}
```

## Getting Started

For hello-extensions we write a simple Mixin that allows the `Application` class
to bind a `Logger` class from ApplicationOptions, Components, or `.logger()`
method that is mixed in. `Logger` instances are bound to the key
`loggers.${Logger.name}`. Once a Logger has been bound, the user can retrieve it
by using
[Dependency Injection](http://loopback.io/doc/en/lb4/Dependency-injection.html)
and the key for the `Logger`.

### What is a Logger?

> A Logger class is provides a mechanism for logging messages of varying
> priority by providing an implementation for `Logger.info()` &
> `Logger.error()`. An example of a Logger is `console` which has
> `console.log()` and `console.error()`.

#### An example Logger

```ts
class ColorLogger implements Logger {
  log(...args: LogArgs) {
    console.log('log  :', ...args);
  }

  error(...args: LogArgs) {
    // log in red color
    console.log('\x1b[31m error: ', ...args, '\x1b[0m');
  }
}
```

## LoggerMixin

A complete & functional implementation can be found in `logger.mixin.ts`. _Here
are some key things to keep in mind when writing your own Mixin_.

### constructor()

A Mixin constructor must take an array of any type as it's argument. This would
represent `ApplicationOptions` for our base class `Application` as well as any
properties we would like for our Mixin.

It is also important for the constructor to call `super(args)` so `Application`
continues to work as expected.

```ts
constructor(...args: any[]) {
  super(args);
}
```

### Binding via `ApplicationOptions`

As mentioned earlier, since our `args` represents `ApplicationOptions`, we can
make it possible for users to pass in their `Logger` implementations in a
`loggers` array on `ApplicationOptions`. We can then read the array and
automatically bind these for the user.

#### Example user experience

```ts
class MyApp extends LoggerMixin(Application) {
  constructor(...args: any[]) {
    super(...args);
  }
}

const app = new MyApp({
  loggers: [ColorLogger],
});
```

#### Example Implementation

To implement this, we would check `this.options` to see if it has a `loggers`
array and if so, bind it by calling the `.logger()` method. (More on that
below).

```ts
if (this.options.loggers) {
  for (const logger of this.options.loggers) {
    this.logger(logger);
  }
}
```

### Binding via `.logger()`

As mentioned earlier, we can add a new function to our `Application` class
called `.logger()` into which a user would pass in their `Logger` implementation
so we can bind it to the `loggers.*` key for them. We just add this new method
on our partial Mixin class.

```ts
logger(logClass: Logger) {
  const loggerKey = `loggers.${logClass.name}`;
  this.bind(loggerKey).toClass(logClass);
}
```

### Binding a `Logger` from a `Component`

Our base class of `Application` already has a method that binds components. We
can modify this method to continue binding a `Component` as usual but also
binding any `Logger` instances provided by that `Component`. When modifying
behavior of an existing method, we can ensure existing behavior by calling the
`super.method()`. In our case the method is `.component()`.

```ts
component(component: Constructor<any>) {
  super.component(component); // ensures existing behavior from Application
  this.mountComponentLoggers(component);
}
```

We have now modified `.component()` to do it's thing and then call our method
`mountComponentLoggers()`. In this method is where we check for `Logger`
implementations declared by the component in a `loggers` array by retrieving the
instance of the `Component`. Then if `loggers` array exists, we bind the
`Logger` instances as normal (by leveraging our `.logger()` method).

```ts
mountComponentLoggers(component: Constructor<any>) {
  const componentKey = `components.${component.name}`;
  const compInstance = this.getSync(componentKey);

  if (compInstance.loggers) {
    for (const logger of compInstance.loggers) {
      this.logger(logger);
    }
  }
}
```

## Retrieving the Logger instance

Now that we have bound a Logger to our Application via one of the many ways made
possible by `LoggerMixin`, we need to be able to retrieve it so we can use it.
Let's say we want to use it in a controller. Here's an example to retrieving it
so we can use it.

```ts
class MyController {
  constructor(@inject('loggers.ColorLogger') protected log: Logger) {}

  helloWorld() {
    this.log.log('hello log');
    this.log.error('hello error');
  }
}
```

## Examples for using LoggerMixin

### Using the app's `.logger()` method

```ts
class LoggingApplication extends LoggerMixin(Application) {
  constructor(...args: any[]) {
    super(...args);
    this.logger(ColorLogger);
  }
}
```

### Using the app's constructor

```ts
class LoggerApplication extends LoggerMixin(Application) {
  constructor() {
    super({
      loggers: [ColorLogger],
    });
  }
}
```

### Binding a Logger provided by a component

```ts
class LoggingComponent implements Component {
  loggers: [ColorLogger];
}

const app = new LoggingApplication();
app.component(LoggingComponent); // Logger from MyComponent will be bound to loggers.ColorLogger
```
