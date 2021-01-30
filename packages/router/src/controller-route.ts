// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/router
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingAddress,
  Constructor,
  Context,
  CoreBindings,
  instantiateClass,
  ValueOrPromise,
} from '@loopback/core';

/**
 * A controller instance with open properties/methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ControllerInstance = {[name: string]: any} & object;

/**
 * A factory function to create controller instances synchronously or
 * asynchronously
 *
 * @remarks
 * This differs from the IoC Provider interface in 3 major ways:
 *
 * 1. It is a function instead of a class.
 * 2. The only parameter must be the current context.
 * 3. It is not bound to Context, hence binding cannot be resolved.
 *
 * This factory has a more limited scope compared to Providers as it's typical
 * use if for retrieving and/or instantiating an instance of the controller, but
 * not for "building" a controller differently.
 */
export type ControllerFactory<T extends ControllerInstance> = (
  ctx: Context,
) => ValueOrPromise<T>;

/**
 * Create a controller factory function for a given binding key
 * @param key - Binding key
 */
export function createControllerFactoryForBinding<T>(
  address: BindingAddress<T>,
): ControllerFactory<T> {
  return async ctx => {
    return ctx.get<T>(address);
  };
}

/**
 * Controller class
 *
 * @remarks
 * Not to be confused with `ControllerClass` in `@loopback/core`.
 */
export type ControllerClass<T extends ControllerInstance> = Constructor<T>;

/**
 * Create a {@link ControllerFactory} function for a given class
 * @param controllerCtor - Controller class
 */
export function createControllerFactoryForClass<T>(
  controllerCtor: ControllerClass<T>,
): ControllerFactory<T> {
  return async ctx => {
    // By default, we get an instance of the controller from the context
    // using `controllers.<controllerName>` as the key
    let inst = await ctx.get<T>(
      `${CoreBindings.CONTROLLERS}.${controllerCtor.name}`,
      {
        optional: true,
      },
    );
    if (inst === undefined) {
      inst = await instantiateClass<T>(controllerCtor, ctx);
    }
    return inst;
  };
}

/**
 * Create a controller factory function for a given instance
 * @param controllerCtor - Controller instance
 */
export function createControllerFactoryForInstance<T>(
  controllerInst: T,
): ControllerFactory<T> {
  return ctx => controllerInst;
}
