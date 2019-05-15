---
lang: en
title: 'Interceptor generator'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Interceptor-generator.html
---

{% include content/generator-create-app.html lang=page.lang %}

### Synopsis

Adds a new [interceptor](Interceptors.md#global-interceptors) class to a
LoopBack application.

```sh
lb4 interceptor [--global] [--group <group>] [<name>]
```

### Arguments and options

`<name>` - Name of the interceptor to create as an argument to the command. If
provided, the tool will use that as the default when it prompts for the name.

`--global` - Optional flag to indicate a global interceptor (default to `true`).
Use `--no-global` to set it to `false`.

`--group <group>` - Optional name of the interceptor group to sort the execution
of global interceptors by group. This option is only supported for global
interceptors.

### Interactive Prompts

The tool will prompt you for:

- **Name of the interceptor.** _(interceptorName)_ If the name had been supplied
  from the command line, the prompt is skipped.

- **Is it a global interceptor.** _(isGlobal)_ If the flag had been supplied
  from the command line, the prompt is skipped.

- **Group of the interceptor.** _(groupName)_ If the group had been supplied
  from the command line, the prompt is skipped. See
  [Order of invocation for interceptors](https://loopback.io/doc/en/lb4/Interceptors.html#order-of-invocation-for-interceptors).

### Output

Once all the prompts have been answered, the CLI will do the following:

- Create an interceptor class as follows:
  `/src/interceptors/${interceptorName}.interceptor.ts`
- Update `/src/interceptors/index.ts` to export the newly created global
  interceptor class.

The generated class looks like:

1. A global interceptor

```ts
import {
  /* inject, */
  globalInterceptor,
  bind,
  Interceptor,
  Provider,
} from '@loopback/context';

/**
 * This class will be bound to the application as a global `Interceptor` during
 * `boot`
 */
@globalInterceptor('auth', {tags: {name: 'test'}})
export class TestInterceptor implements Provider<Interceptor> {
  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
```

2. A non-global interceptor

```ts
import {
  /* inject, */
  bind,
  Interceptor,
  Provider,
} from '@loopback/context';

/**
 * This class will be bound to the application as a global `Interceptor` during
 * `boot`
 */
@bind({tags: {namespace: 'interceptors', name: 'test'}})
export class TestInterceptor implements Provider<Interceptor> {
  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
```
