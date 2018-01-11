// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {BoundValue, ValueOrPromise, Binding} from './binding';
import {isPromise} from './is-promise';
import {
  describeInjectedArguments,
  describeInjectedProperties,
  Injection,
} from './inject';
import * as assert from 'assert';
import * as debugModule from 'debug';
import {DecoratorFactory} from '@loopback/metadata';

const debug = debugModule('loopback:context:resolver');
const debugSession = debugModule('loopback:context:resolver:session');
const getTargetName = DecoratorFactory.getTargetName;

/**
 * A class constructor accepting arbitrary arguments.
 */
export type Constructor<T> =
  // tslint:disable-next-line:no-any
  new (...args: any[]) => T;

/**
 * Object to keep states for a session to resolve bindings and their
 * dependencies within a context
 */
export class ResolutionSession {
  /**
   * A stack of bindings for the current resolution session. It's used to track
   * the path of dependency resolution and detect circular dependencies.
   */
  readonly bindings: Binding[] = [];

  readonly injections: Injection[] = [];

  /**
   * Take a snapshot of the ResolutionSession so that we can pass it to
   * `@inject.getter` without interferring with the current session
   */
  clone() {
    const copy = new ResolutionSession();
    copy.bindings.push(...this.bindings);
    copy.injections.push(...this.injections);
    return copy;
  }

  /**
   * Start to resolve a binding within the session
   * @param binding Binding
   * @param session Resolution session
   */
  static enterBinding(
    binding: Binding,
    session?: ResolutionSession,
  ): ResolutionSession {
    session = session || new ResolutionSession();
    session.enter(binding);
    return session;
  }

  /**
   * Push an injection into the session
   * @param injection Injection
   * @param session Resolution session
   */
  static enterInjection(
    injection: Injection,
    session?: ResolutionSession,
  ): ResolutionSession {
    session = session || new ResolutionSession();
    session.enterInjection(injection);
    return session;
  }

  static describeInjection(injection?: Injection) {
    /* istanbul ignore if */
    if (injection == null) return injection;
    const name = getTargetName(
      injection.target,
      injection.member,
      injection.methodDescriptorOrParameterIndex,
    );
    return {
      targetName: name,
      bindingKey: injection.bindingKey,
      metadata: injection.metadata,
    };
  }

  /**
   * Push the injection onto the session
   * @param injection Injection
   */
  enterInjection(injection: Injection) {
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession(
        'Enter injection:',
        ResolutionSession.describeInjection(injection),
      );
    }
    this.injections.push(injection);
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Injection path:', this.getInjectionPath());
    }
  }

  /**
   * Pop the last injection
   */
  exitInjection() {
    const injection = this.injections.pop();
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession(
        'Exit injection:',
        ResolutionSession.describeInjection(injection),
      );
      debugSession('Injection path:', this.getInjectionPath() || '<empty>');
    }
    return injection;
  }

  /**
   * Getter for the current binding
   */
  get injection() {
    return this.injections[this.injections.length - 1];
  }

  /**
   * Getter for the current binding
   */
  get binding() {
    return this.bindings[this.bindings.length - 1];
  }

  /**
   * Enter the resolution of the given binding. If
   * @param binding Binding
   */
  enter(binding: Binding) {
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Enter binding:', binding.toJSON());
    }
    if (this.bindings.indexOf(binding) !== -1) {
      throw new Error(
        `Circular dependency detected on path '${this.getBindingPath()} --> ${
          binding.key
        }'`,
      );
    }
    this.bindings.push(binding);
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Binding path:', this.getBindingPath());
    }
  }

  /**
   * Exit the resolution of a binding
   */
  exit() {
    const binding = this.bindings.pop();
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Exit binding:', binding && binding.toJSON());
      debugSession('Binding path:', this.getBindingPath() || '<empty>');
    }
    return binding;
  }

  /**
   * Get the binding path as `bindingA --> bindingB --> bindingC`.
   */
  getBindingPath() {
    return this.bindings.map(b => b.key).join(' --> ');
  }

  /**
   * Get the injection path as `injectionA->injectionB->injectionC`.
   */
  getInjectionPath() {
    return this.injections
      .map(i => ResolutionSession.describeInjection(i)!.targetName)
      .join(' --> ');
  }
}

/**
 * Create an instance of a class which constructor has arguments
 * decorated with `@inject`.
 *
 * The function returns a class when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param ctor The class constructor to call.
 * @param ctx The context containing values for `@inject` resolution
 * @param session Optional session for binding and dependency resolution
 * @param nonInjectedArgs Optional array of args for non-injected parameters
 */
export function instantiateClass<T>(
  ctor: Constructor<T>,
  ctx: Context,
  session?: ResolutionSession,
  // tslint:disable-next-line:no-any
  nonInjectedArgs?: any[],
): T | Promise<T> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Instantiating %s', getTargetName(ctor));
    if (nonInjectedArgs && nonInjectedArgs.length) {
      debug('Non-injected arguments:', nonInjectedArgs);
    }
  }
  session = session || new ResolutionSession();
  const argsOrPromise = resolveInjectedArguments(ctor, '', ctx, session);
  const propertiesOrPromise = resolveInjectedProperties(ctor, ctx, session);
  let inst: T | Promise<T>;
  if (isPromise(argsOrPromise)) {
    // Instantiate the class asynchronously
    inst = argsOrPromise.then(args => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Injected arguments for %s():', ctor.name, args);
      }
      return new ctor(...args);
    });
  } else {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Injected arguments for %s():', ctor.name, argsOrPromise);
    }
    // Instantiate the class synchronously
    inst = new ctor(...argsOrPromise);
  }
  if (isPromise(propertiesOrPromise)) {
    return propertiesOrPromise.then(props => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Injected properties for %s:', ctor.name, props);
      }
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
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Injected properties for %s:', ctor.name, propertiesOrPromise);
      }
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
 * @param session Optional session for binding and dependency resolution
 */
function resolve<T>(
  ctx: Context,
  injection: Injection,
  session?: ResolutionSession,
): ValueOrPromise<T> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Resolving an injection:',
      ResolutionSession.describeInjection(injection),
    );
  }
  let resolved: ValueOrPromise<T>;
  // Push the injection onto the session
  session = ResolutionSession.enterInjection(injection, session);
  if (injection.resolve) {
    // A custom resolve function is provided
    resolved = injection.resolve(ctx, injection, session);
  } else {
    // Default to resolve the value from the context by binding key
    resolved = ctx.getValueOrPromise(injection.bindingKey, session);
  }
  if (isPromise(resolved)) {
    resolved = resolved
      .then(r => {
        session!.exitInjection();
        return r;
      })
      .catch(e => {
        session!.exitInjection();
        return Promise.reject(e);
      });
  } else {
    session.exitInjection();
  }
  return resolved;
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
 * @param method The method name. If set to '', the constructor will
 * be used.
 * @param ctx The context containing values for `@inject` resolution
 * @param session Optional session for binding and dependency resolution
 * @param nonInjectedArgs Optional array of args for non-injected parameters
 */
export function resolveInjectedArguments(
  target: Object,
  method: string,
  ctx: Context,
  session?: ResolutionSession,
  // tslint:disable-next-line:no-any
  nonInjectedArgs?: any[],
): BoundValue[] | Promise<BoundValue[]> {
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
  nonInjectedArgs = nonInjectedArgs || [];

  const argLength = DecoratorFactory.getNumberOfParameters(target, method);
  const args: BoundValue[] = new Array(argLength);
  let asyncResolvers: Promise<void>[] | undefined = undefined;

  let nonInjectedIndex = 0;
  for (let ix = 0; ix < argLength; ix++) {
    const injection = ix < injectedArgs.length ? injectedArgs[ix] : undefined;
    if (injection == null || (!injection.bindingKey && !injection.resolve)) {
      if (nonInjectedIndex < nonInjectedArgs.length) {
        // Set the argument from the non-injected list
        args[ix] = nonInjectedArgs[nonInjectedIndex++];
        continue;
      } else {
        const name = getTargetName(target, method, ix);
        throw new Error(
          `Cannot resolve injected arguments for ${name}: ` +
            `The arguments[${ix}] is not decorated for dependency injection, ` +
            `but a value is not supplied`,
        );
      }
    }

    const valueOrPromise = resolve(ctx, injection, session);
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
  target: Object,
  method: string,
  ctx: Context,
  // tslint:disable-next-line:no-any
  nonInjectedArgs?: any[],
): ValueOrPromise<BoundValue> {
  const methodName = getTargetName(target, method);
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Invoking method %s', methodName);
    if (nonInjectedArgs && nonInjectedArgs.length) {
      debug('Non-injected arguments:', nonInjectedArgs);
    }
  }
  const argsOrPromise = resolveInjectedArguments(
    target,
    method,
    ctx,
    undefined,
    nonInjectedArgs,
  );
  const targetWithMethods = <{[method: string]: Function}>target;
  assert(
    typeof targetWithMethods[method] === 'function',
    `Method ${method} not found`,
  );
  if (isPromise(argsOrPromise)) {
    // Invoke the target method asynchronously
    return argsOrPromise.then(args => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Injected arguments for %s:', methodName, args);
      }
      return targetWithMethods[method](...args);
    });
  } else {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Injected arguments for %s:', methodName, argsOrPromise);
    }
    // Invoke the target method synchronously
    return targetWithMethods[method](...argsOrPromise);
  }
}

export type KV = {[p: string]: BoundValue};

/**
 * Given a class with properties decorated with `@inject`,
 * return the map of properties resolved using the values
 * bound in `ctx`.

 * The function returns an argument array when all dependencies were
 * resolved synchronously, or a Promise otherwise.
 *
 * @param constructor The class for which properties should be resolved.
 * @param ctx The context containing values for `@inject` resolution
 * @param session Optional session for binding and dependency resolution
 */
export function resolveInjectedProperties(
  constructor: Function,
  ctx: Context,
  session?: ResolutionSession,
): KV | Promise<KV> {
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Resolving injected properties for %s', getTargetName(constructor));
  }
  const injectedProperties = describeInjectedProperties(constructor.prototype);

  const properties: KV = {};
  let asyncResolvers: Promise<void>[] | undefined = undefined;

  const propertyResolver = (p: string) => (v: BoundValue) =>
    (properties[p] = v);

  for (const p in injectedProperties) {
    const injection = injectedProperties[p];
    if (!injection.bindingKey && !injection.resolve) {
      const name = getTargetName(constructor, p);
      throw new Error(
        `Cannot resolve injected property ${name}: ` +
          `The property ${p} is not decorated for dependency injection.`,
      );
    }

    const valueOrPromise = resolve(ctx, injection, session);
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
