// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  BindingSpec,
  Constructor,
  ValueOrPromise,
} from '@loopback/context';
import {CoreTags} from './keys';

/**
 * Observers to handle life cycle start/stop events
 */
export interface LifeCycleObserver {
  /**
   * The method to be invoked during `start`
   */
  start?(): ValueOrPromise<void>;
  /**
   * The method to be invoked during `stop`
   */
  stop?(): ValueOrPromise<void>;
}

const lifeCycleMethods: (keyof LifeCycleObserver)[] = ['start', 'stop'];

/**
 * Test if an object implements LifeCycleObserver
 * @param obj - An object
 */
export function isLifeCycleObserver(obj: object): obj is LifeCycleObserver {
  const candidate = obj as Partial<LifeCycleObserver>;
  return lifeCycleMethods.some(m => typeof candidate[m] === 'function');
}

/**
 * Test if a class implements LifeCycleObserver
 * @param ctor - A class
 */
export function isLifeCycleObserverClass(
  ctor: Constructor<unknown>,
): ctor is Constructor<LifeCycleObserver> {
  return ctor.prototype && isLifeCycleObserver(ctor.prototype);
}

/**
 * A `BindingTemplate` function to configure the binding as life cycle observer
 * by tagging it with `CoreTags.LIFE_CYCLE_OBSERVER`.
 *
 * @param binding - Binding object
 */
export function asLifeCycleObserver<T = unknown>(binding: Binding<T>) {
  return binding.tag(CoreTags.LIFE_CYCLE_OBSERVER);
}

/**
 * Find all life cycle observer bindings. By default, a binding tagged with
 * `CoreTags.LIFE_CYCLE_OBSERVER`. It's used as `BindingFilter`.
 */
export function lifeCycleObserverFilter(binding: Readonly<Binding>): boolean {
  return binding.tagMap[CoreTags.LIFE_CYCLE_OBSERVER] != null;
}

/**
 * Sugar decorator to mark a class as life cycle observer
 * @param group - Optional observer group name
 * @param specs - Optional bindings specs
 */
export function lifeCycleObserver(group = '', ...specs: BindingSpec[]) {
  return bind(
    asLifeCycleObserver,
    {
      tags: {
        [CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: group,
      },
    },
    ...specs,
  );
}
