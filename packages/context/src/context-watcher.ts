// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, BindingFilter} from './context';
import {Binding} from './binding';
import {ResolutionSession} from './resolution-session';
import {resolveList, ValueOrPromise} from './value-promise';
import {Getter} from './inject';
import * as debugFactory from 'debug';
const debug = debugFactory('loopback:context:watcher');

/**
 * Watching a given context chain to maintain a live list of matching bindings
 * and their resolved values within the context hierarchy.
 *
 * This class is the key utility to implement dynamic extensions for extension
 * points. For example, the RestServer can react to `controller` bindings even
 * they are added/removed/updated after the application starts.
 *
 */
export class ContextWatcher<T = unknown> {
  private _cachedBindings: Readonly<Binding<T>>[] | undefined;
  private _cachedValues: ValueOrPromise<T[]> | undefined;

  constructor(
    protected readonly ctx: Context,
    public readonly filter: BindingFilter,
  ) {}

  watch() {
    debug('Start watching context %s', this.ctx.name);
    this.ctx.subscribe(this);
  }

  unwatch() {
    debug('Stop watching context %s', this.ctx.name);
    this.ctx.unsubscribe(this);
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
    this._cachedBindings = this.ctx.find(this.filter);
    return this._cachedBindings;
  }

  /**
   * Listen on `bind` or `unbind` and invalidate the cache
   */
  listen(event: 'bind' | 'unbind', binding: Readonly<Binding<unknown>>) {
    this.reset();
  }

  /**
   * Reset the watcher by invalidating its cache
   */
  reset() {
    debug('Invalidating cache');
    this._cachedBindings = undefined;
    this._cachedValues = undefined;
  }

  /**
   * Resolve values for the matching bindings
   * @param session
   */
  resolve(session?: ResolutionSession) {
    debug('Resolving values');
    this._cachedValues = resolveList(this.bindings, b => {
      return b.getValue(this.ctx, ResolutionSession.fork(session));
    });
    return this._cachedValues;
  }

  /**
   * Get the list of resolved values. If they are not cached, it tries tp find
   * and resolve them.
   */
  values(): Promise<T[]> {
    debug('Reading values');
    // [REVIEW] We need to get values in the next tick so that it can pick up
    // binding changes as `Context` publishes such events in `process.nextTick`
    return new Promise<T[]>(resolve => {
      process.nextTick(async () => {
        if (this._cachedValues == null) {
          this._cachedValues = this.resolve();
        }
        resolve(await this._cachedValues);
      });
    });
  }

  /**
   * As a `Getter` function
   */
  asGetter(): Getter<T[]> {
    return () => this.values();
  }
}
