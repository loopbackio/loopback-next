// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory} from '@loopback/metadata';
import * as assert from 'assert';
import * as debugModule from 'debug';
import {BindingScope} from './binding';
import {isBindingAddress} from './binding-filter';
import {BindingAddress} from './binding-key';
import {Context} from './context';
import {
  describeInjectedArguments,
  describeInjectedProperties,
  Injection,
} from './inject';
import {ResolutionOptions, ResolutionSession} from './resolution-session';
import {
  BoundValue,
  Constructor,
  MapObject,
  resolveList,
  resolveMap,
  transformValueOrPromise,
  ValueOrPromise,
} from './value-promise';

const debug = debugModule('loopback:context:resolver');
const getTargetName = DecoratorFactory.getTargetName;

/**
 * Create an instance of a class which constructor has arguments
 * decorated with `@inject`.
 *
 * The function returns a class when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param ctor - The class constructor to call.
 * @param ctx - The context containing values for `@inject` resolution
 * @param session - Optional session for binding and dependency resolution
 * @param nonInjectedArgs - Optional array of args for non-injected parameters
 */
export function instantiateClass<T>(
  ctor: Constructor<T>,
  ctx: Context,
  session?: ResolutionSession,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nonInjectedArgs?: any[],
): ValueOrPromise<T> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Instantiating %s', getTargetName(ctor));
    if (nonInjectedArgs && nonInjectedArgs.length) {
      debug('Non-injected arguments:', nonInjectedArgs);
    }
  }
  const argsOrPromise = resolveInjectedArguments(
    ctor,
    '',
    ctx,
    session,
    nonInjectedArgs,
  );
  const propertiesOrPromise = resolveInjectedProperties(ctor, ctx, session);
  const inst: ValueOrPromise<T> = transformValueOrPromise(
    argsOrPromise,
    args => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Injected arguments for %s():', ctor.name, args);
      }
      return new ctor(...args);
    },
  );
  return transformValueOrPromise(propertiesOrPromise, props => {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Injected properties for %s:', ctor.name, props);
    }
    return transformValueOrPromise(inst, obj => Object.assign(obj, props));
  });
}

/**
 * If the scope of current binding is `SINGLETON`, reset the context
 * to be the one that owns the current binding to make sure a singleton
 * does not have dependencies injected from child contexts unless the
 * injection is for method (excluding constructor) parameters.
 */
function resolveContext(
  ctx: Context,
  injection: Readonly<Injection>,
  session?: ResolutionSession,
) {
  const currentBinding = session && session.currentBinding;
  if (
    currentBinding == null ||
    currentBinding.scope !== BindingScope.SINGLETON
  ) {
    // No current binding or its scope is not `SINGLETON`
    return ctx;
  }

  const isConstructorOrPropertyInjection =
    // constructor injection
    !injection.member ||
    // property injection
    typeof injection.methodDescriptorOrParameterIndex !== 'number';

  if (isConstructorOrPropertyInjection) {
    // Set context to the owner context of the current binding for constructor
    // or property injections against a singleton
    ctx = ctx.getOwnerContext(currentBinding.key)!;
  }
  return ctx;
}

/**
 * Resolve the value or promise for a given injection
 * @param ctx - Context
 * @param injection - Descriptor of the injection
 * @param session - Optional session for binding and dependency resolution
 */
function resolve<T>(
  ctx: Context,
  injection: Readonly<Injection>,
  session?: ResolutionSession,
): ValueOrPromise<T> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Resolving an injection:',
      ResolutionSession.describeInjection(injection),
    );
  }

  ctx = resolveContext(ctx, injection, session);
  const resolved = ResolutionSession.runWithInjection(
    s => {
      if (injection.resolve) {
        // A custom resolve function is provided
        return injection.resolve(ctx, injection, s);
      } else {
        // Default to resolve the value from the context by binding key
        assert(
          isBindingAddress(injection.bindingSelector),
          'The binding selector must be an address (string or BindingKey)',
        );
        const key = injection.bindingSelector as BindingAddress;
        const options: ResolutionOptions = {
          session: s,
          ...injection.metadata,
        };
        return ctx.getValueOrPromise(key, options);
      }
    },
    injection,
    session,
  );
  return resolved;
}

/**
 * Given a function with arguments decorated with `@inject`,
 * return the list of arguments resolved using the values
 * bound in `ctx`.

 * The function returns an argument array when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param target - The class for constructor injection or prototype for method
 * injection
 * @param method - The method name. If set to '', the constructor will
 * be used.
 * @param ctx - The context containing values for `@inject` resolution
 * @param session - Optional session for binding and dependency resolution
 * @param nonInjectedArgs - Optional array of args for non-injected parameters
 */
export function resolveInjectedArguments(
  target: object,
  method: string,
  ctx: Context,
  session?: ResolutionSession,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nonInjectedArgs?: any[],
): ValueOrPromise<BoundValue[]> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Resolving injected arguments for %s', getTargetName(target, method));
  }
  const targetWithMethods = <{[method: string]: Function}>target;
  if (method) {
    assert(
      typeof targetWithMethods[method] === 'function',
      `Method ${method} not found`,
    );
  }
  // NOTE: the array may be sparse, i.e.
  //   Object.keys(injectedArgs).length !== injectedArgs.length
  // Example value:
  //   [ , 'key1', , 'key2']
  const injectedArgs = describeInjectedArguments(target, method);
  const extraArgs = nonInjectedArgs || [];

  let argLength = DecoratorFactory.getNumberOfParameters(target, method);

  // Please note `injectedArgs` contains `undefined` for non-injected args
  const numberOfInjected = injectedArgs.filter(i => i != null).length;
  if (argLength < numberOfInjected + extraArgs.length) {
    /**
     * `Function.prototype.length` excludes the rest parameter and only includes
     * parameters before the first one with a default value. For example,
     * `hello(@inject('name') name: string = 'John')` gives 0 for argLength
     */
    argLength = numberOfInjected + extraArgs.length;
  }

  let nonInjectedIndex = 0;
  return resolveList(new Array(argLength), (val, ix) => {
    // The `val` argument is not used as the resolver only uses `injectedArgs`
    // and `extraArgs` to return the new value
    const injection = ix < injectedArgs.length ? injectedArgs[ix] : undefined;
    if (
      injection == null ||
      (!injection.bindingSelector && !injection.resolve)
    ) {
      if (nonInjectedIndex < extraArgs.length) {
        // Set the argument from the non-injected list
        return extraArgs[nonInjectedIndex++];
      } else {
        const name = getTargetName(target, method, ix);
        throw new Error(
          `Cannot resolve injected arguments for ${name}: ` +
            `The arguments[${ix}] is not decorated for dependency injection, ` +
            `but a value is not supplied`,
        );
      }
    }

    return resolve(
      ctx,
      injection,
      // Clone the session so that multiple arguments can be resolved in parallel
      ResolutionSession.fork(session),
    );
  });
}

/**
 * Given a class with properties decorated with `@inject`,
 * return the map of properties resolved using the values
 * bound in `ctx`.

 * The function returns an argument array when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param constructor - The class for which properties should be resolved.
 * @param ctx - The context containing values for `@inject` resolution
 * @param session - Optional session for binding and dependency resolution
 */
export function resolveInjectedProperties(
  constructor: Function,
  ctx: Context,
  session?: ResolutionSession,
): ValueOrPromise<MapObject<BoundValue>> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Resolving injected properties for %s', getTargetName(constructor));
  }
  const injectedProperties = describeInjectedProperties(constructor.prototype);

  return resolveMap(injectedProperties, (injection, p) => {
    if (!injection.bindingSelector && !injection.resolve) {
      const name = getTargetName(constructor, p);
      throw new Error(
        `Cannot resolve injected property ${name}: ` +
          `The property ${p} is not decorated for dependency injection.`,
      );
    }

    return resolve(
      ctx,
      injection,
      // Clone the session so that multiple properties can be resolved in parallel
      ResolutionSession.fork(session),
    );
  });
}
