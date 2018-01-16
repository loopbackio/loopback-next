// Copyright IBM Corp. 2018. All Rights Reserved.
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
 * Wrapper for bindings tracked by resolution sessions
 */
export interface BindingElement {
  type: 'binding';
  value: Binding;
}

/**
 * Wrapper for injections tracked by resolution sessions
 */
export interface InjectionElement {
  type: 'injection';
  value: Injection;
}

/**
 * Binding or injection elements tracked by resolution sessions
 */
export type ResolutionElement = BindingElement | InjectionElement;

/**
 * Object to keep states for a session to resolve bindings and their
 * dependencies within a context
 */
export class ResolutionSession {
  /**
   * A stack of bindings for the current resolution session. It's used to track
   * the path of dependency resolution and detect circular dependencies.
   */
  readonly stack: ResolutionElement[] = [];

  /**
   * Fork the current session so that a new one with the same stack can be used
   * in parallel or future resolutions, such as multiple method arguments,
   * multiple properties, or a getter function
   * @param session The current session
   */
  static fork(session?: ResolutionSession): ResolutionSession | undefined {
    if (session === undefined) return undefined;
    const copy = new ResolutionSession();
    copy.stack.push(...session.stack);
    return copy;
  }

  /**
   * Start to resolve a binding within the session
   * @param binding The current binding
   * @param session The current resolution session
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
   * @param injection The current injection
   * @param session The current resolution session
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
   * @param injection Injection object
   */
  static describeInjection(injection?: Injection) {
    /* istanbul ignore if */
    if (injection == null) return undefined;
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
   * @param injection Injection The current injection
   */
  pushInjection(injection: Injection) {
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession(
        'Enter injection:',
        ResolutionSession.describeInjection(injection),
      );
    }
    this.stack.push({type: 'injection', value: injection});
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Resolution path:', this.getResolutionPath());
    }
  }

  /**
   * Pop the last injection
   */
  popInjection() {
    const top = this.stack.pop();
    if (top === undefined || top.type !== 'injection') {
      throw new Error('The top element must be an injection');
    }

    const injection = top.value;
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession(
        'Exit injection:',
        ResolutionSession.describeInjection(injection),
      );
      debugSession('Resolution path:', this.getResolutionPath() || '<empty>');
    }
    return injection;
  }

  /**
   * Getter for the current injection
   */
  get currentInjection(): Injection | undefined {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const element = this.stack[i];
      switch (element.type) {
        case 'injection':
          return element.value;
      }
    }
    return undefined;
  }

  /**
   * Getter for the current binding
   */
  get currentBinding(): Binding | undefined {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const element = this.stack[i];
      switch (element.type) {
        case 'binding':
          return element.value;
      }
    }
    return undefined;
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
    if (this.stack.find(i => i.type === 'binding' && i.value === binding)) {
      throw new Error(
        `Circular dependency detected on path '${this.getBindingPath()} --> ${
          binding.key
        }'`,
      );
    }
    this.stack.push({type: 'binding', value: binding});
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Resolution path:', this.getResolutionPath());
    }
  }

  /**
   * Exit the resolution of a binding
   */
  popBinding() {
    const top = this.stack.pop();
    if (top === undefined || top.type !== 'binding') {
      throw new Error('The top element must be a binding');
    }
    const binding = top.value;
    /* istanbul ignore if */
    if (debugSession.enabled) {
      debugSession('Exit binding:', binding && binding.toJSON());
      debugSession('Resolution path:', this.getResolutionPath() || '<empty>');
    }
    return binding;
  }

  /**
   * Get the binding path as `bindingA --> bindingB --> bindingC`.
   */
  getBindingPath() {
    return this.stack
      .filter(i => i.type === 'binding')
      .map(b => (<Binding>b.value).key)
      .join(' --> ');
  }

  /**
   * Get the injection path as `injectionA --> injectionB --> injectionC`.
   */
  getInjectionPath() {
    return this.stack
      .filter(i => i.type === 'injection')
      .map(
        i =>
          ResolutionSession.describeInjection(<Injection>i.value)!.targetName,
      )
      .join(' --> ');
  }

  private static describe(e: ResolutionElement) {
    switch (e.type) {
      case 'injection':
        return '@' + ResolutionSession.describeInjection(e.value)!.targetName;
      case 'binding':
        return e.value.key;
    }
  }

  /**
   * Get the resolution path including bindings and injections, for example:
   * `bindingA --> @ClassA[0] --> bindingB --> @ClassB.prototype.prop1
   * --> bindingC`.
   */
  getResolutionPath() {
    return this.stack.map(i => ResolutionSession.describe(i)).join(' --> ');
  }
}
