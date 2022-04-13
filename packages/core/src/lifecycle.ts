// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingSpec,
  BindingTagFilter,
  Constructor,
  filterByTag,
  injectable,
  ValueOrPromise,
} from '@loopback/context';
import {CoreTags} from './keys';

/**
 * Observers to handle life cycle init/start/stop events
 */
export interface LifeCycleObserver {
  /**
   * The method to be invoked during `init`. It will only be called at most once
   * for a given application instance.
   */
  init?(...injectedArgs: unknown[]): ValueOrPromise<void>;
  /**
   * The method to be invoked during `start`
   */
  start?(...injectedArgs: unknown[]): ValueOrPromise<void>;
  /**
   * The method to be invoked during `stop`
   */
  stop?(...injectedArgs: unknown[]): ValueOrPromise<void>;
}

const lifeCycleMethods: (keyof LifeCycleObserver)[] = ['init', 'start', 'stop'];

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
export const lifeCycleObserverFilter: BindingTagFilter = filterByTag(
  CoreTags.LIFE_CYCLE_OBSERVER,
);

/**
 * Sugar decorator to mark a class as life cycle observer
 * @param group - Optional observer group name
 * @param specs - Optional bindings specs
 */
export function lifeCycleObserver(group = '', ...specs: BindingSpec[]) {
  return injectable(
    asLifeCycleObserver,
    {
      tags: {
        [CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: group,
      },
    },
    ...specs,
  );
}
