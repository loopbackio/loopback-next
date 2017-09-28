// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {BoundValue, ValueOrPromise} from './binding';
import {isPromise} from './is-promise';
import {
  describeInjectedArguments,
  describeInjectedProperties,
  Injection,
} from './inject';
import * as assert from 'assert';

/**
 * A class constructor accepting arbitrary arguments.
 */
export type Constructor<T> =
  // tslint:disable-next-line:no-any
  new (...args: any[]) => T;

/**
 * Create an instance of a class which constructor has arguments
 * decorated with `@inject`.
 *
 * The function returns a class when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param ctor The class constructor to call.
 * @param ctx The context containing values for `@inject` resolution
 * @param nonInjectedArgs Optional array of args for non-injected parameters
 */
export function instantiateClass<T>(
  ctor: Constructor<T>,
  ctx: Context,
  // tslint:disable-next-line:no-any
  nonInjectedArgs?: any[],
): T | Promise<T> {
  const argsOrPromise = resolveInjectedArguments(ctor, ctx, '');
  const propertiesOrPromise = resolveInjectedProperties(ctor, ctx);
  let inst: T | Promise<T>;
  if (isPromise(argsOrPromise)) {
    // Instantiate the class asynchronously
    inst = argsOrPromise.then(args => new ctor(...args));
  } else {
    // Instantiate the class synchronously
    inst = new ctor(...argsOrPromise);
  }
  if (isPromise(propertiesOrPromise)) {
    return propertiesOrPromise.then(props => {
      if (isPromise(inst)) {
        // Inject the properties asynchronously
        return inst.then(obj => Object.assign(obj, props));
      } else {
        // Inject the properties synchronously
        return Object.assign(inst, props);
      }
    });
  } else {
    if (isPromise(inst)) {
      // Inject the properties asynchronously
      return inst.then(obj => Object.assign(obj, propertiesOrPromise));
    } else {
      // Inject the properties synchronously
      return Object.assign(inst, propertiesOrPromise);
    }
  }
}

/**
 * Resolve the value or promise for a given injection
 * @param ctx Context
 * @param injection Descriptor of the injection
 */
function resolve<T>(ctx: Context, injection: Injection): ValueOrPromise<T> {
  if (injection.resolve) {
    // A custom resolve function is provided
    return injection.resolve(ctx, injection);
  }
  // Default to resolve the value from the context by binding key
  return ctx.getValueOrPromise(injection.bindingKey);
}

/**
 * Given a function with arguments decorated with `@inject`,
 * return the list of arguments resolved using the values
 * bound in `ctx`.

 * The function returns an argument array when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param target The class for constructor injection or prototype for method
 * injection
 * @param ctx The context containing values for `@inject` resolution
 * @param method The method name. If set to '', the constructor will
 * be used.
 * @param nonInjectedArgs Optional array of args for non-injected parameters
 */
export function resolveInjectedArguments(
  // tslint:disable-next-line:no-any
  target: any,
  ctx: Context,
  method: string,
  // tslint:disable-next-line:no-any
  nonInjectedArgs?: any[],
): BoundValue[] | Promise<BoundValue[]> {
  if (method) {
    assert(typeof target[method] === 'function', `Method ${method} not found`);
  }
  // NOTE: the array may be sparse, i.e.
  //   Object.keys(injectedArgs).length !== injectedArgs.length
  // Example value:
  //   [ , 'key1', , 'key2']
  const injectedArgs = describeInjectedArguments(target, method);
  nonInjectedArgs = nonInjectedArgs || [];

  const argLength = method ? target[method].length : target.length;
  const args: BoundValue[] = new Array(argLength);
  let asyncResolvers: Promise<void>[] | undefined = undefined;

  let nonInjectedIndex = 0;
  for (let ix = 0; ix < argLength; ix++) {
    const injection = ix < injectedArgs.length ? injectedArgs[ix] : undefined;
    if (injection == null || (!injection.bindingKey && !injection.resolve)) {
      const name = method || target.name;
      if (nonInjectedIndex < nonInjectedArgs.length) {
        // Set the argument from the non-injected list
        args[ix] = nonInjectedArgs[nonInjectedIndex++];
        continue;
      } else {
        throw new Error(
          `Cannot resolve injected arguments for function ${name}: ` +
            `The arguments[${ix}] is not decorated for dependency injection, ` +
            `but a value is not supplied`,
        );
      }
    }

    const valueOrPromise = resolve(ctx, injection);
    if (isPromise(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(
        valueOrPromise.then((v: BoundValue) => (args[ix] = v)),
      );
    } else {
      args[ix] = valueOrPromise as BoundValue;
    }
  }

  if (asyncResolvers) {
    return Promise.all(asyncResolvers).then(() => args);
  } else {
    return args;
  }
}

/**
 * Invoke an instance method with dependency injection
 * @param target Target of the method, it will be the class for a static
 * method, and instance or class prototype for a prototype method
 * @param method Name of the method
 * @param ctx Context
 * @param nonInjectedArgs Optional array of args for non-injected parameters
 */
export function invokeMethod(
  // tslint:disable-next-line:no-any
  target: any,
  method: string,
  ctx: Context,
  // tslint:disable-next-line:no-any
  nonInjectedArgs?: any[],
): ValueOrPromise<BoundValue> {
  const argsOrPromise = resolveInjectedArguments(
    target,
    ctx,
    method,
    nonInjectedArgs,
  );
  assert(typeof target[method] === 'function', `Method ${method} not found`);
  if (isPromise(argsOrPromise)) {
    // Invoke the target method asynchronously
    return argsOrPromise.then(args => target[method](...args));
  } else {
    // Invoke the target method synchronously
    return target[method](...argsOrPromise);
  }
}

export type KV = {[p: string]: BoundValue};

export function resolveInjectedProperties(
  fn: Function,
  ctx: Context,
): KV | Promise<KV> {
  const injectedProperties = describeInjectedProperties(fn.prototype);

  const properties: KV = {};
  let asyncResolvers: Promise<void>[] | undefined = undefined;

  const propertyResolver = (p: string) => (v: BoundValue) =>
    (properties[p] = v);

  for (const p in injectedProperties) {
    const injection = injectedProperties[p];
    if (!injection.bindingKey && !injection.resolve) {
      throw new Error(
        `Cannot resolve injected property for class ${fn.name}: ` +
          `The property ${p} was not decorated for dependency injection.`,
      );
    }
    const valueOrPromise = resolve(ctx, injection);
    if (isPromise(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(valueOrPromise.then(propertyResolver(p)));
    } else {
      properties[p] = valueOrPromise as BoundValue;
    }
  }

  if (asyncResolvers) {
    return Promise.all(asyncResolvers).then(() => properties);
  } else {
    return properties;
  }
}
