// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Context } from './context';
import { Binding, BoundValue } from './binding';
import { isPromise } from './isPromise';
import { describeInjectedArguments } from './inject';

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
export function createClassInstance<T>(ctor: Constructor<T>, ctx: Context): T | Promise<T> {
  const argsOrPromise = resolveInjectedArguments(ctor, ctx);
  if (isPromise(argsOrPromise)) {
    return argsOrPromise.then(args => new ctor(...args));
  } else {
    return new ctor(...argsOrPromise);
  }
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
    const bindingKey = injectedArgs[ix];
    if (!bindingKey) {
      throw new Error(
        `Cannot resolve injected arguments for function ${fn.name}: ` +
        `The argument ${ix + 1} was not decorated for dependency injection.`);
    }

    const binding = ctx.getBinding(bindingKey);
    const valueOrPromise = binding.getValue();
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
