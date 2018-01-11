// Copyright IBM Corp. 2013, 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, ValueOrPromise, BoundValue} from './binding';
import {Injection} from './inject';
import {isPromise} from './is-promise';
import * as debugModule from 'debug';
import {DecoratorFactory} from '@loopback/metadata';

const debugSession = debugModule('loopback:context:resolver:session');
const getTargetName = DecoratorFactory.getTargetName;

/**
 * A function to be executed with the resolution session
 */
export type ResolutionAction = (
  session?: ResolutionSession,
) => ValueOrPromise<BoundValue>;

/**
 * Try to run an action that returns a promise or a value
 * @param action A function that returns a promise or a value
 * @param finalAction A function to be called once the action
 * is fulfilled or rejected (synchronously or asynchronously)
 */
function tryWithFinally(
  action: () => ValueOrPromise<BoundValue>,
  finalAction: () => void,
) {
  let result: ValueOrPromise<BoundValue>;
  try {
    result = action();
  } catch (err) {
    finalAction();
    throw err;
  }
  if (isPromise(result)) {
    // Once (promise.finally)[https://github.com/tc39/proposal-promise-finally
    // is supported, the following can be simplifed as
    // `result = result.finally(finalAction);`
    result = result.then(
      val => {
        finalAction();
        return val;
      },
      err => {
        finalAction();
        throw err;
      },
    );
  } else {
    finalAction();
  }
  return result;
}

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

  /**
   * A stack of injections for the current resolution session.
   */
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
  private static enterBinding(
    binding: Binding,
    session?: ResolutionSession,
  ): ResolutionSession {
    session = session || new ResolutionSession();
    session.pushBinding(binding);
    return session;
  }

  /**
   * Run the given action with the given binding and session
   * @param action A function to do some work with the resolution session
   * @param binding The current binding
   * @param session The current resolution session
   */
  static runWithBinding(
    action: ResolutionAction,
    binding: Binding,
    session?: ResolutionSession,
  ) {
    const resolutionSession = ResolutionSession.enterBinding(binding, session);
    return tryWithFinally(
      () => action(resolutionSession),
      () => resolutionSession.popBinding(),
    );
  }

  /**
   * Push an injection into the session
   * @param injection Injection
   * @param session Resolution session
   */
  private static enterInjection(
    injection: Injection,
    session?: ResolutionSession,
  ): ResolutionSession {
    session = session || new ResolutionSession();
    session.pushInjection(injection);
    return session;
  }

  /**
   * Run the given action with the given injection and session
   * @param action A function to do some work with the resolution session
   * @param binding The current injection
   * @param session The current resolution session
   */
  static runWithInjection(
    action: ResolutionAction,
    injection: Injection,
    session?: ResolutionSession,
  ) {
    const resolutionSession = ResolutionSession.enterInjection(
      injection,
      session,
    );
    return tryWithFinally(
      () => action(resolutionSession),
      () => resolutionSession.popInjection(),
    );
  }

  /**
   * Describe the injection for debugging purpose
   * @param injection
   */
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
  pushInjection(injection: Injection) {
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
  popInjection() {
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
   * Getter for the current injection
   */
  get currentInjection() {
    return this.injections[this.injections.length - 1];
  }

  /**
   * Getter for the current binding
   */
  get currentBinding() {
    return this.bindings[this.bindings.length - 1];
  }

  /**
   * Enter the resolution of the given binding. If
   * @param binding Binding
   */
  pushBinding(binding: Binding) {
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
  popBinding() {
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
