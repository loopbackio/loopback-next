// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 interceptor valid generation of interceptors generates a basic interceptor from CLI with group 1`] = `
import {
  /* inject, */
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';

/**
 * This class will be bound to the application as an \`Interceptor\` during
 * \`boot\`
 */
@globalInterceptor('myGroup', {tags: {name: 'myInterceptor'}})
export class MyInterceptorInterceptor implements Provider<Interceptor> {
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

`;


exports[`lb4 interceptor valid generation of interceptors generates a basic interceptor from CLI with group 2`] = `
export * from './my-interceptor.interceptor';

`;


exports[`lb4 interceptor valid generation of interceptors generates a basic interceptor from command line arguments 1`] = `
import {
  /* inject, */
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';

/**
 * This class will be bound to the application as an \`Interceptor\` during
 * \`boot\`
 */
@globalInterceptor('', {tags: {name: 'myInterceptor'}})
export class MyInterceptorInterceptor implements Provider<Interceptor> {
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

`;


exports[`lb4 interceptor valid generation of interceptors generates a basic interceptor from command line arguments 2`] = `
export * from './my-interceptor.interceptor';

`;


exports[`lb4 interceptor valid generation of interceptors generates a interceptor from a config file 1`] = `
import {
  /* inject, */
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';

/**
 * This class will be bound to the application as an \`Interceptor\` during
 * \`boot\`
 */
@globalInterceptor('', {tags: {name: 'myInterceptor'}})
export class MyInterceptorInterceptor implements Provider<Interceptor> {
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

`;


exports[`lb4 interceptor valid generation of interceptors generates a interceptor from a config file 2`] = `
export * from './my-interceptor.interceptor';

`;


exports[`lb4 interceptor valid generation of interceptors generates a non-global interceptor from CLI 1`] = `
import {
  /* inject, */
  bind,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';

/**
 * This class will be bound to the application as an \`Interceptor\` during
 * \`boot\`
 */
@bind({tags: {key: MyInterceptorInterceptor.BINDING_KEY}})
export class MyInterceptorInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = \`interceptors.\${MyInterceptorInterceptor.name}\`;

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

`;


exports[`lb4 interceptor valid generation of interceptors generates a non-global interceptor from CLI 2`] = `
export * from './my-interceptor.interceptor';

`;


exports[`lb4 interceptor valid generation of interceptors generates a non-global interceptor with prompts 1`] = `
import {
  /* inject, */
  bind,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';

/**
 * This class will be bound to the application as an \`Interceptor\` during
 * \`boot\`
 */
@bind({tags: {key: MyInterceptorInterceptor.BINDING_KEY}})
export class MyInterceptorInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = \`interceptors.\${MyInterceptorInterceptor.name}\`;

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

`;


exports[`lb4 interceptor valid generation of interceptors generates a non-global interceptor with prompts 2`] = `
export * from './my-interceptor.interceptor';

`;
