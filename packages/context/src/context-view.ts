// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {EventEmitter} from 'events';
import {promisify} from 'util';
import {Binding} from './binding';
import {BindingFilter} from './binding-filter';
import {BindingComparator} from './binding-sorter';
import {Context} from './context';
import {
  ContextEventType,
  ContextObserver,
  Subscription,
} from './context-observer';
import {Getter} from './inject';
import {ResolutionSession} from './resolution-session';
import {isPromiseLike, resolveList, ValueOrPromise} from './value-promise';
const debug = debugFactory('loopback:context:view');
const nextTick = promisify(process.nextTick);

/**
 * `ContextView` provides a view for a given context chain to maintain a live
 * list of matching bindings and their resolved values within the context
 * hierarchy.
 *
 * This class is the key utility to implement dynamic extensions for extension
 * points. For example, the RestServer can react to `controller` bindings even
 * they are added/removed/updated after the application starts.
 *
 * `ContextView` is an event emitter that emits the following events:
 * - 'close': when the view is closed (stopped observing context events)
 * - 'refresh': when the view is refreshed as bindings are added/removed
 * - 'resolve': when the cached values are resolved and updated
 */
export class ContextView<T = unknown> extends EventEmitter
  implements ContextObserver {
  protected _cachedBindings: Readonly<Binding<T>>[] | undefined;
  protected _cachedValues: T[] | undefined;
  private _subscription: Subscription | undefined;

  constructor(
    protected readonly context: Context,
    public readonly filter: BindingFilter,
    public readonly comparator?: BindingComparator,
  ) {
    super();
  }

  /**
   * Start listening events from the context
   */
  open() {
    debug('Start listening on changes of context %s', this.context.name);
    if (this.context.isSubscribed(this)) {
      return this._subscription;
    }
    this._subscription = this.context.subscribe(this);
    return this._subscription;
  }

  /**
   * Stop listening events from the context
   */
  close() {
    debug('Stop listening on changes of context %s', this.context.name);
    if (!this._subscription || this._subscription.closed) return;
    this._subscription.unsubscribe();
    this._subscription = undefined;
    this.emit('close');
  }

  /**
   * Get the list of matched bindings. If they are not cached, it tries to find
   * them from the context.
   */
  get bindings(): Readonly<Binding<T>>[] {
    debug('Reading bindings');
    if (this._cachedBindings == null) {
      this._cachedBindings = this.findBindings();
    }
    return this._cachedBindings;
  }

  /**
   * Find matching bindings and refresh the cache
   */
  protected findBindings(): Readonly<Binding<T>>[] {
    debug('Finding matching bindings');
    const found = this.context.find(this.filter);
    if (typeof this.comparator === 'function') {
      found.sort(this.comparator);
    }
    this._cachedBindings = found;
    return found;
  }

  /**
   * Listen on `bind` or `unbind` and invalidate the cache
   */
  observe(event: ContextEventType, binding: Readonly<Binding<unknown>>) {
    this.refresh();
  }

  /**
   * Refresh the view by invalidating its cache
   */
  refresh() {
    debug('Refreshing the view by invalidating cache');
    this._cachedBindings = undefined;
    this._cachedValues = undefined;
    this.emit('refresh');
  }

  /**
   * Resolve values for the matching bindings
   * @param session - Resolution session
   */
  resolve(session?: ResolutionSession): ValueOrPromise<T[]> {
    debug('Resolving values');
    if (this._cachedValues != null) return this._cachedValues;
    let result = resolveList(this.bindings, b => {
      return b.getValue(this.context, ResolutionSession.fork(session));
    });
    if (isPromiseLike(result)) {
      result = result.then(values => {
        this._cachedValues = values;
        this.emit('resolve', values);
        return values;
      });
    } else {
      this._cachedValues = result;
      this.emit('resolve', result);
    }
    return result;
  }

  /**
   * Get the list of resolved values. If they are not cached, it tries to find
   * and resolve them.
   */
  async values(session?: ResolutionSession): Promise<T[]> {
    debug('Reading values');
    // Wait for the next tick so that context event notification can be emitted
    await nextTick();
    if (this._cachedValues == null) {
      this._cachedValues = await this.resolve(session);
    }
    return this._cachedValues;
  }

  /**
   * As a `Getter` function
   */
  asGetter(session?: ResolutionSession): Getter<T[]> {
    return () => this.values(session);
  }

  /**
   * Get the single value
   */
  async singleValue(session?: ResolutionSession): Promise<T | undefined> {
    const values = await this.values(session);
    if (values.length === 0) return undefined;
    if (values.length === 1) return values[0];
    throw new Error(
      'The ContextView has more than one value. Use values() to access them.',
    );
  }
}

/**
 * Create a context view as a getter with the given filter
 * @param ctx - Context object
 * @param bindingFilter - A function to match bindings
 * @param session - Resolution session
 */
export function createViewGetter<T = unknown>(
  ctx: Context,
  bindingFilter: BindingFilter,
  session?: ResolutionSession,
): Getter<T[]>;

/**
 * Create a context view as a getter with the given filter and sort matched
 * bindings by the comparator.
 * @param ctx - Context object
 * @param bindingFilter - A function to match bindings
 * @param bindingComparator - A function to compare two bindings
 * @param session - Resolution session
 */
export function createViewGetter<T = unknown>(
  ctx: Context,
  bindingFilter: BindingFilter,
  bindingComparator?: BindingComparator,
  session?: ResolutionSession,
): Getter<T[]>;

/**
 * Create a context view as a getter
 * @param ctx - Context object
 * @param bindingFilter - A function to match bindings
 * @param bindingComparatorOrSession - A function to sort matched bindings or
 * resolution session if the comparator is not needed
 * @param session - Resolution session if the comparator is provided
 */
export function createViewGetter<T = unknown>(
  ctx: Context,
  bindingFilter: BindingFilter,
  bindingComparatorOrSession?: BindingComparator | ResolutionSession,
  session?: ResolutionSession,
): Getter<T[]> {
  let bindingComparator: BindingComparator | undefined = undefined;
  if (typeof bindingComparatorOrSession === 'function') {
    bindingComparator = bindingComparatorOrSession;
  } else if (bindingComparatorOrSession instanceof ResolutionSession) {
    session = bindingComparatorOrSession;
  }

  const view = new ContextView<T>(ctx, bindingFilter, bindingComparator);
  view.open();
  return view.asGetter(session);
}
