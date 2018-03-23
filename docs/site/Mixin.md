---
lang: en
title: 'Mixin'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Mixin.html
summary:
---

It is a commonly used JavaScript/TypeScript strategy to extend a class with new
properties and methods.

A good approach to apply mixins is defining them as sub-class factories. Then
declare the new mixed class as:

```js
class MixedClass extends MixinFoo(MixinBar(BaseClass)) {}
```

Check article
[real mixins with javascript classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
to learn more about it.

## Define Mixin

By defining a mixin, you create a mixin function that takes in a base class, and
returns a new class extending the base class with new properties and methods
mixed to it.

For example you have a simple controller which only has a greeter function
prints out 'hi!':

{% include code-caption.html content="Controllers/myController.ts" %}

```ts
class SimpleController {
  constructor() {}
  greet() {
    console.log('hi!');
  }
}
```

Now let's add mixins to it:

- A time stamp mixin that adds a property `createdAt` to a record when a
  controller instance is created.

- A logger mixin to provide logging tools.

Define mixin `timeStampMixin`:

{% include code-caption.html content="Mixins/timeStampMixin.ts" %}

```ts
import {Class} from '@loopback/repository';

export function timeStampMixin<T extends Class<any>>(baseClass: T) {
  return class extends baseClass {
    // add a new property `createdAt`
    public createdAt: Date;
    constructor(...args: any[]) {
      super(args);
      this.createTS = new Date();
    }
    printTimeStamp() {
      console.log('Instance created at: ' + this.createdAt);
    }
  };
}
```

And define mixin `loggerMixin`:

{% include code-caption.html content="Mixins/loggerMixin.ts" %}

```ts
import {Class} from '@loopback/repository';

function loggerMixin<T extends Class<any>>(baseClass: T) {
  return class extends baseClass {
    // add a new method `log()`
    log(str: string) {
      console.log('Prints out a string: ' + str);
    }
  };
}
```

Now you can extend `SimpleController` with the two mixins:

{% include code-caption.html content="Controllers/myController.ts" %}

```ts
import {timeStampMixin} from 'Mixins/timeStampMixin.ts';
import {loggerMixin} from 'Mixins/loggerMixin.ts';

class SimpleController {
  constructor() {}
  greet() {
    console.log('hi!');
  }
}

class AdvancedController extends loggerMixin(
  timeStampMixin(SimpleController),
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
