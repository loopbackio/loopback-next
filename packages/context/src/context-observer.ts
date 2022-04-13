// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding} from './binding';
import {BindingFilter} from './binding-filter';
import {Context} from './context';
import {ValueOrPromise} from './value-promise';

/**
 * Context event types. We support `bind` and `unbind` for now but
 * keep it open for new types
 */
export type ContextEventType = 'bind' | 'unbind' | string;

/**
 * Listen on `bind`, `unbind`, or other events
 * @param eventType - Context event type
 * @param binding - The binding as event source
 * @param context - Context object for the binding event
 */
export type ContextObserverFn = (
  eventType: ContextEventType,
  binding: Readonly<Binding<unknown>>,
  context: Context,
) => ValueOrPromise<void>;

/**
 * Observers of context bind/unbind events
 */
export interface ContextObserver {
  /**
   * An optional filter function to match bindings. If not present, the listener
   * will be notified of all binding events.
   */
  filter?: BindingFilter;

  /**
   * Listen on `bind`, `unbind`, or other events
   * @param eventType - Context event type
   * @param binding - The binding as event source
   */
  observe: ContextObserverFn;
}

/**
 * Context event observer type - An instance of `ContextObserver` or a function
 */
export type ContextEventObserver = ContextObserver | ContextObserverFn;
