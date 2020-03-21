---
lang: en
title: 'Testing your extension'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Testing-your-extension.html
---

## Overview

LoopBack 4 extensions are often used by other teams. A thorough test suite for
your extension brings powerful benefits to all your users, including:

- Validating the behavior of the extension
- Preventing unwanted changes to the API or functionality of the extension
- Providing working samples and code snippets that serve as functional
  documentation for your users

## Project Setup

We recommend that you use `@loopback/cli` to create the extension, as it
installs several tools you can use for testing, such as `mocha`, assertion
libraries, linters, etc.

The `@loopback/cli` includes the `mocha` automated test runner and a `test`
folder containing recommended folders for various types of tests. `Mocha` is
enabled by default if `@loopback/cli` is used to create the extension project.
The `@loopback/cli` installs and configures `mocha`, creates the `test` folder,
and also enters a `test` command in your `package.json`.

Assertion libraries such as [ShouldJS](http://shouldjs.github.io/) (as
`expect`), [SinonJS](http://sinonjs.org/), and a test sandbox are made available
through the convenient `@loopback/testlab` package. The `testlab` is also
installed by `@loopback/cli`.

### Manual Setup - Using Mocha

- Install `mocha` by running `npm i --save-dev mocha`. This will save the
  `mocha` package in `package.json` as well.
- Under `scripts` in `package.json` add the following:
  `test: npm run build && mocha --recursive ./dist/test`

## Types of tests

A comprehensive test suite tests many aspects of your code. We recommend that
you write unit, integration, and acceptance tests to test your application from
a variety of perspectives. Comprehensive testing ensures correctness,
integration, and future compatibility.

You may use any development methodology you want to write your extension; the
important thing is to test it with an automated test suite. In Traditional
development methodology, you write the code first and then write the tests. In
Test-driven development methodology, you write the tests first, see them fail,
then write the code to pass the tests.

### Unit Tests

A unit test tests the smallest unit of code possible, which in this case is a
function. Unit tests ensure variable and state changes by outside actors don't
affect the results. [Test doubles](https://en.wikipedia.org/wiki/Test_double)
should be used to substitute function dependencies. You can learn more about
test doubles and Unit testing here:
[Testing your Application: Unit testing](Testing-your-application.md#unit-testing).

#### Controllers

At its core, a controller is a simple class that is responsible for related
actions on an object. Performing unit tests on a controller in an extension is
the same as performing unit tests on a controller in an application.

To test a controller, you instantiate a new instance of your controller class
and test a function, providing a test double for constructor arguments as
needed. Following are examples that illustrate how to perform a unit test on a
controller class:

{% include code-caption.html content="src/controllers/ping.controller.ts" %}

```ts
export class PingController {
  @get('/ping')
  ping(msg?: string) {
    return `You pinged with ${msg}`;
  }
}
```

{% include code-caption.html content="src/__tests__/unit/controllers/ping.controller.unit.ts" %}

```ts
import {PingController} from '../../..';
import {expect} from '@loopback/testlab';

describe('PingController() unit', () => {
  it('pings with no input', () => {
    const controller = new PingController();
    const result = controller.ping();
    expect(result).to.equal('You pinged with undefined');
  });

  it("pings with msg 'hello'", () => {
    const controller = new PingController();
    const result = controller.ping('hello');
    expect(result).to.equal('You pinged with hello');
  });
});
```

You can find an advanced example on testing controllers in
[Unit test your Controllers](Testing-your-application.md#unit-test-your-controllers).

#### Decorators

The recommended usage of a decorator is to store metadata about a class or a
class method. The decorator implementation usually provides a function to
retrieve the related metadata based on the class name and method name. For a
unit test for a decorator, it is important to test that that it stores and
retrieves the correct metadata. _The retrieval gets tested as a result of
validating whether the metadata was stored or not._

Following is an example for testing a decorator:

{% include code-caption.html content="src/decorators/test.decorator.ts" %}

```ts
export function test(file: string) {
  return function (target: Object, methodName: string): void {
    Reflector.defineMetadata(
      'example.msg.decorator.metadata.key',
      {file},
      target,
      methodName,
    );
  };
}

export function getTestMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): {file: string} {
  return Reflector.getMetadata(
    'example.msg.decorator.metadata.key',
    controllerClass.prototype,
    methodName,
  );
}
```

{% include code-caption.html content="src/__tests__/unit/decorators/test.decorator.unit.ts" %}

```ts
import {test, getTestMetadata} from '../../..';
import {expect} from '@loopback/testlab';

describe('test.decorator (unit)', () => {
  it('can store test name via a decorator', () => {
    class TestClass {
      @test('me.test.ts')
      me() {}
    }

    const metadata = getTestMetadata(TestClass, 'me');
    expect(metadata).to.be.a.Object();
    expect(metadata.file).to.be.eql('me.test.ts');
  });
});
```

#### Mixins

A Mixin is a TypeScript function that extends the `Application` Class, adding
new constructor properties, methods, etc. It is difficult to write a unit test
for a Mixin without the `Application` Class dependency. The recommended practice
is to write an integration test is described in
[Mixin Integration Tests](#mixin-integration-tests).

#### Providers

A Provider is a Class that implements the `Provider` interface. This interface
requires the Class to have a `value()` function. A unit test for a provider
should test the `value()` function by instantiating a new `Provider` class,
using a test double for any constructor arguments.

{% include code-caption.html content="src/providers/random-number.provider.ts" %}

```ts
import {Provider} from '@loopback/context';

export class RandomNumberProvider implements Provider<number> {
  value() {
    return (max: number): number => {
      return Math.floor(Math.random() * max) + 1;
    };
  }
}
```

{% include code-caption.html content="src/__tests__/unit/providers/random-number.provider.unit.ts" %}

```ts
import {RandomNumberProvider} from '../../..';
import {expect} from '@loopback/testlab';

describe('RandomNumberProvider (unit)', () => {
  it('generates a random number within range', () => {
    const provider = new RandomNumberProvider().value();
    const random: number = provider(3);

    expect(random).to.be.a.Number();
    expect(random).to.equalOneOf([1, 2, 3]);
  });
});
```

#### Repositories

_This section will be provided in a future version._

### Integration Tests

An integration test plays an important part in your test suite by ensuring your
extension artifacts work together as well as `@loopback`. It is recommended to
test two items together and substitute other integrations as test doubles so it
becomes apparent where the integration errors may occur.

#### Mixin Integration Tests

A Mixin extends a base Class by returning an anonymous class. Thus, a Mixin is
tested by actually using the Mixin with its base Class. Since this requires two
Classes to work together, an integration test is needed. A Mixin test checks
that new or overridden methods exist and work as expected in the new Mixed
class. Following is an example for an integration test for a Mixin:

{% include code-caption.html content="src/mixins/time.mixin.ts" %}

```ts
import {Constructor} from '@loopback/context';
export function TimeMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    constructor(...args: any[]) {
      super(...args);
      if (!this.options) this.options = {};

      if (typeof this.options.timeAsString !== 'boolean') {
        this.options.timeAsString = false;
      }
    }

    time() {
      if (this.options.timeAsString) {
        return new Date().toString();
      }
      return new Date();
    }
  };
}
```

{% include code-caption.html content="src/__tests__/integration/mixins/time.mixin.integration.ts" %}

```ts
import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {TimeMixin} from '../../..';

describe('TimeMixin (integration)', () => {
  it('mixed class has .time()', () => {
    const myApp = new AppWithTime();
    expect(typeof myApp.time).to.be.eql('function');
  });

  it('returns time as string', () => {
    const myApp = new AppWithLogLevel({
      timeAsString: true,
    });

    const time = myApp.time();
    expect(time).to.be.a.String();
  });

  it('returns time as Date', () => {
    const myApp = new AppWithLogLevel();

    const time = myApp.time();
    expect(time).to.be.a.Date();
  });

  class AppWithTime extends TimeMixin(Application) {}
});
```

### Acceptance Test

An Acceptance test for an extension is a comprehensive test written end-to-end.
Acceptance tests cover the user scenarios. An acceptance test uses all of the
extension artifacts such as decorators, mixins, providers, repositories, etc. No
test doubles are needed for an Acceptance test. This is a black box test where
you don't know or care about the internals of the extensions. You will be using
the extension as if you were the consumer.

Due to the complexity of an Acceptance test, there is no example given here.
Have a look at
[loopback4-example-log-extension](https://github.com/strongloop/loopback-next/tree/master/examples/log-extension)
to understand the extension artifacts and their usage. An Acceptance test can be
seen here:
[src/**tests**/acceptance/log.extension.acceptance.ts](https://github.com/strongloop/loopback-next/blob/master/examples/log-extension/src/__tests__/acceptance/log.extension.acceptance.ts).
