---
lang: en
title: 'Mixin'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Mixin.html
---

It is a commonly used JavaScript/TypeScript strategy to extend a class with new
properties and methods.

A good approach to apply mixins is defining them as sub-class factories. Then
declare the new mixed class as:

```ts
class MixedClass extends MixinFoo(MixinBar(BaseClass)) {}
```

Check the article,
["Real" Mixins with JavaScript Classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/),
to learn more about it.

## Define a Mixin

By defining a mixin, you create a mixin function that takes in a base class, and
returns a new class extending the base class with new properties and methods
mixed to it.

For example, you have a simple controller which only has a greeter function
prints out 'hi!':

{% include code-caption.html content="src/controllers/using-mixin.controller.ts" %}

```ts
class SimpleController {
  constructor() {}
  greet() {
    console.log('hi!');
  }
}
```

Now let's add two mixins to it:

1. A time stamp mixin that adds a property `createdAt` to a record when a
   controller instance is created.

2. A logger mixin to provide logging tools.

Define mixin `TimeStampMixin`:

{% include code-caption.html content="src/mixins/time-stamp.mixin.ts" %}

```ts
import {MixinTarget} from '@loopback/core';
import {Class} from '@loopback/repository';

export function TimeStampMixin<T extends MixinTarget<object>>(baseClass: T) {
  return class extends baseClass {
    // add a new property `createdAt`
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public createdAt: Date;
    constructor(...args: any[]) {
      super(args);
      this.createdAt = new Date();
    }
    printTimeStamp() {
      console.log('Instance created at: ' + this.createdAt);
    }
  };
}
```

And define mixin `LoggerMixin`:

{% include code-caption.html content="src/mixins/logger.mixin.ts" %}

```ts
import {MixinTarget} from '@loopback/core';
import {Class} from '@loopback/repository';

function LoggerMixin<T extends MixinTarget<object>>(baseClass: T) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return class extends baseClass {
    // add a new method `log()`
    log(str: string) {
      console.log('Prints out a string: ' + str);
    }
  };
}
```

{% include note.html content="A TypeScript limitation prevents mixins from
overriding existing members of a base class. Hence the need for `// @ts-ignore`
as shown above. See the
[API docs](https://loopback.io/doc/en/lb4/apidocs.core.mixintarget.html) for
more info."}

Now you can extend `SimpleController` with the two mixins:

{% include code-caption.html content="src/controllers/using-mixin.controller.ts" %}

```ts
import {TimeStampMixin} from '../mixins/time-stamp.mixin.ts';
import {LoggerMixin} from '../mixins/logger.mixin.ts';

class SimpleController {
  constructor() {}
  greet() {
    console.log('hi!');
  }
}

class AdvancedController extends LoggerMixin(
  TimeStampMixin(SimpleController),
) {}

// verify new method and property are added to `AdvancedController`:
let aControllerInst = new AdvancedController();
aControllerInst.printTimeStamp();
// print out: Instance created at: Tue Oct 17 2017 22:28:49 GMT-0400 (EDT)
aControllerInst.logger('hello world!');
// print out: Prints out a string: hello world!
```

## References

Here are some articles explaining ES2015 and TypeScript mixins in more details:

- <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Mix-ins>

- <http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/>

- <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html>
