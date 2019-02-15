// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {promisify} from 'util';
import {Binding} from './binding';
import {BindingFilter} from './binding-filter';
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
 */
export class ContextView<T = unknown> implements ContextObserver {
  protected _cachedBindings: Readonly<Binding<T>>[] | undefined;
  protected _cachedValues: T[] | undefined;
  private _subscription: Subscription | undefined;

  constructor(
    protected readonly context: Context,
    public readonly filter: BindingFilter,
  ) {}

  /**
   * Start listening events from the context
   */
  open() {
    debug('Start listening on changes of context %s', this.context.name);
    return (this._subscription = this.context.subscribe(this));
  }

  /**
   * Stop listening events from the context
   */
  close() {
    debug('Stop listening on changes of context %s', this.context.name);
    if (!this._subscription || this._subscription.closed) return;
    this._subscription.unsubscribe();
    this._subscription = undefined;
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
  protected findBindings() {
    debug('Finding matching bindings');
    this._cachedBindings = this.context.find(this.filter);
    return this._cachedBindings;
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
  }

  /**
   * Resolve values for the matching bindings
   * @param session Resolution session
   */
  resolve(session?: ResolutionSession): ValueOrPromise<T[]> {
    debug('Resolving values');
    if (this._cachedValues != null) return this._cachedValues;
    let result = resolveList(this.bindings, b => {
      return b.getValue(this.context, ResolutionSession.fork(session));
    });
    if (isPromiseLike(result)) {
      result = result.then(values => (this._cachedValues = values));
    } else {
      this._cachedValues = result;
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
}
