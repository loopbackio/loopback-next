// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Context } from './context';
import { Binding, BoundValue, ValueOrPromise } from './binding';
import { isPromise } from './isPromise';
import { describeInjectedArguments, describeInjectedProperties, Injection } from './inject';

// tslint:disable-next-line:no-any
export type Constructor<T> = new(...args: any[]) => T;

/**
 * Create an instance of a class which constructor has arguments
 * decorated with `@inject`.
 *
 * The function returns a class when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param ctor The class constructor to call.
 * @param ctx The context containing values for `@inject` resolution
 */
export function instantiateClass<T>(ctor: Constructor<T>, ctx: Context): T | Promise<T> {
  const argsOrPromise = resolveInjectedArguments(ctor, ctx);
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
    return propertiesOrPromise.then((props) => {
      if (isPromise(inst)) {
        // Inject the properties asynchrounously
        return inst.then(obj => Object.assign(obj, props));
      } else {
        // Inject the properties synchrounously
        return Object.assign(inst, props);
      }
    });
  } else {
    if (isPromise(inst)) {
      // Inject the properties asynchrounously
      return inst.then(obj => Object.assign(obj, propertiesOrPromise));
    } else {
      // Inject the properties synchrounously
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
  const binding = ctx.getBinding(injection.bindingKey);
  return binding.getValue(ctx);
}

/**
 * Given a function with arguments decorated with `@inject`,
 * return the list of arguments resolved using the values
 * bound in `ctx`.

 * The function returns an argument array when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param fn The function for which the arguments should be resolved.
 * @param ctx The context containing values for `@inject` resolution
 */
export function resolveInjectedArguments(fn: Function, ctx: Context): BoundValue[] | Promise<BoundValue[]> {
  // NOTE: the array may be sparse, i.e.
  //   Object.keys(injectedArgs).length !== injectedArgs.length
  // Example value:
  //   [ , 'key1', , 'key2']
  const injectedArgs = describeInjectedArguments(fn);

  const args: BoundValue[] = new Array(fn.length);
  let asyncResolvers: Promise<void>[] | undefined = undefined;

  for (let ix = 0; ix < fn.length; ix++) {
    const injection = injectedArgs[ix];
    if (!injection.bindingKey && !injection.resolve) {
      throw new Error(
        `Cannot resolve injected arguments for function ${fn.name}: ` +
        `The argument ${ix + 1} was not decorated for dependency injection.`);
    }

    const valueOrPromise = resolve(ctx, injection);
    if (isPromise(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(valueOrPromise.then((v: BoundValue) => args[ix] = v));
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

export type KV = { [p: string]: BoundValue };

export function resolveInjectedProperties(fn: Function, ctx: Context): KV | Promise<KV> {
  const injectedProperties = describeInjectedProperties(fn);

  const properties: KV = {};
  let asyncResolvers: Promise<void>[] | undefined = undefined;

  const propertyResolver = (p: string) => ((v: BoundValue) => properties[p] = v);

  for (const p in injectedProperties) {
    const injection = injectedProperties[p];
    if (!injection.bindingKey && !injection.resolve) {
      throw new Error(
        `Cannot resolve injected property for class ${fn.name}: ` +
        `The property ${p} was not decorated for dependency injection.`);
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
