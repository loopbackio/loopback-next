# Decorators

## Overview

Decorators provide annotations for class methods and arguments. Decorators use
the form `@decorator` where `decorator` is the name of the function that will be
called at runtime.

## Basic Usage

### txIdFromHeader

This simple decorator allows you to annotate a `Controller` method argument. The
decorator will annotate the method argument with the value of the header
`X-Transaction-Id` from the request.

**Example**

```ts
class MyController {
  @get('/')
  getHandler(@txIdFromHeader() txId: string) {
    return `Your transaction id is: ${txId}`;
  }
}
```

## Related Resources

You can check out the following resource to learn more about decorators and how
they are used in LoopBack Next.

- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Decorators in LoopBack](http://loopback.io/doc/en/lb4/Decorators.html)
