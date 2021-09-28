// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {EventEmitter} from 'events';
import {promisify} from 'util';
import {Binding} from './binding';
import {BindingFilter} from './binding-filter';
import {BindingComparator} from './binding-sorter';
import {Context} from './context';
import {ContextEvent} from './context-event';
import {ContextEventType, ContextObserver} from './context-observer';
import {Subscription} from './context-subscription';
import {Getter} from './inject';
import {
  asResolutionOptions,
  ResolutionOptions,
  ResolutionOptionsOrSession,
  ResolutionSession,
} from './resolution-session';
import {isPromiseLike, resolveList, ValueOrPromise} from './value-promise';
const debug = debugFactory('loopback:context:view');
const nextTick = promisify(process.nextTick);

/**
 * An event emitted by a `ContextView`
 */
export interface ContextViewEvent<T> extends ContextEvent {
  /**
   * Optional cached value for an `unbind` event
   */
  cachedValue?: T;
}

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
 * - 'bind': when a binding is added to the view
 * - 'unbind': when a binding is removed from the view
 * - 'close': when the view is closed (stopped observing context events)
 * - 'refresh': when the view is refreshed as bindings are added/removed
 * - 'resolve': when the cached values are resolved and updated
 */
export class ContextView<T = unknown>
  extends EventEmitter
  implements ContextObserver
{
  /**
   * An array of cached bindings that matches the binding filter
   */
  protected _cachedBindings: Readonly<Binding<T>>[] | undefined;
  /**
   * A map of cached values by binding
   */
  protected _cachedValues: Map<Readonly<Binding<T>>, T> | undefined;
  private _subscription: Subscription | undefined;

  /**
   * Create a context view
   * @param context - Context object to watch
   * @param filter - Binding filter to match bindings of interest
   * @param comparator - Comparator to sort the matched bindings
   */
  constructor(
    public readonly context: Context,
    public readonly filter: BindingFilter,
    public readonly comparator?: BindingComparator,
    private resolutionOptions?: Omit<ResolutionOptions, 'session'>,
  ) {
    super();
  }

  /**
   * Update the cached values keyed by binding
   * @param values - An array of resolved values
   */
  private updateCachedValues(values: T[]) {
    if (this._cachedBindings == null) return undefined;
    this._cachedValues = new Map();
    for (let i = 0; i < this._cachedBindings?.length; i++) {
      this._cachedValues.set(this._cachedBindings[i], values[i]);
    }
    return this._cachedValues;
  }

  /**
   * Get an array of cached values
   */
  private getCachedValues() {
    return Array.from(this._cachedValues?.values() ?? []);
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
    /* istanbul ignore if */
    if (debug.enabled) {
      debug(
        'Bindings found',
        found.map(b => b.key),
      );
    }
    return found;
  }

  /**
   * Listen on `bind` or `unbind` and invalidate the cache
   */
  observe(
    event: ContextEventType,
    binding: Readonly<Binding<unknown>>,
    context: Context,
  ) {
    const ctxEvent: ContextViewEvent<T> = {
      context,
      binding,
      type: event,
    };
    debug('Observed event %s %s %s', event, binding.key, context.name);

    if (event === 'unbind') {
      const cachedValue = this._cachedValues?.get(
        binding as Readonly<Binding<T>>,
      );
      this.emit(event, {...ctxEvent, cachedValue});
    } else {
      this.emit(event, ctxEvent);
    }

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
  resolve(session?: ResolutionOptionsOrSession): ValueOrPromise<T[]> {
    debug('Resolving values');
    if (this._cachedValues != null) {
      return this.getCachedValues();
    }
    const bindings = this.bindings;
    let result = resolveList(bindings, b => {
      const options = {
        ...this.resolutionOptions,
        ...asResolutionOptions(session),
      };
      options.session = ResolutionSession.fork(options.session);
      return b.getValue(this.context, options);
    });
    if (isPromiseLike(result)) {
      result = result.then(values => {
        const list = values.filter(v => v != null) as T[];
        this.updateCachedValues(list);
        this.emit('resolve', list);
        return list;
      });
    } else {
      // Clone the array so that the cached values won't be mutated
      const list = (result = result.filter(v => v != null) as T[]);
      this.updateCachedValues(list);
      this.emit('resolve', list);
    }
    return result as ValueOrPromise<T[]>;
  }

  /**
   * Get the list of resolved values. If they are not cached, it tries to find
   * and resolve them.
   */
  async values(session?: ResolutionOptionsOrSession): Promise<T[]> {
    debug('Reading values');
    // Wait for the next tick so that context event notification can be emitted
    await nextTick();
    if (this._cachedValues == null) {
      return this.resolve(session);
    }
    return this.getCachedValues();
  }

  /**
   * As a `Getter` function
   */
  asGetter(session?: ResolutionOptionsOrSession): Getter<T[]> {
    return () => this.values(session);
  }

  /**
   * Get the single value
   */
  async singleValue(
    session?: ResolutionOptionsOrSession,
  ): Promise<T | undefined> {
    const values = await this.values(session);
    if (values.length === 0) return undefined;
    if (values.length === 1) return values[0];
    throw new Error(
      'The ContextView has more than one value. Use values() to access them.',
    );
  }

  /**
   * The "bind" event is emitted when a new binding is added to the view.
   *
   * @param eventName The name of the event - always `bind`.
   * @param listener The listener function to call when the event is emitted.
   */
  on(
    eventName: 'bind',
    listener: <V>(event: ContextViewEvent<V>) => void,
  ): this;

  /**
   * The "unbind" event is emitted a new binding is removed from the view.
   *
   * @param eventName The name of the event - always `unbind`.
   * @param listener The listener function to call when the event is emitted.
   */
  on(
    eventName: 'unbind',
    listener: <V>(event: ContextViewEvent<V> & {cachedValue?: V}) => void,
  ): this;

  /**
   * The "refresh" event is emitted when the view is refreshed as bindings are
   * added/removed.
   *
   * @param eventName The name of the event - always `refresh`.
   * @param listener The listener function to call when the event is emitted.
   */
  on(eventName: 'refresh', listener: () => void): this;

  /**
   * The "resolve" event is emitted when the cached values are resolved and
   * updated.
   *
   * @param eventName The name of the event - always `refresh`.
   * @param listener The listener function to call when the event is emitted.
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  on(eventName: 'refresh', listener: <V>(result: V[]) => void): this;

  /**
   * The "close" event is emitted when the view is closed (stopped observing
   * context events)
   *
   * @param eventName The name of the event - always `close`.
   * @param listener The listener function to call when the event is emitted.
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  on(eventName: 'close', listener: () => void): this;

  // The generic variant inherited from EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * The "bind" event is emitted when a new binding is added to the view.
   *
   * @param eventName The name of the event - always `bind`.
   * @param listener The listener function to call when the event is emitted.
   */
  once(
    eventName: 'bind',
    listener: <V>(event: ContextViewEvent<V>) => void,
  ): this;

  /**
   * The "unbind" event is emitted a new binding is removed from the view.
   *
   * @param eventName The name of the event - always `unbind`.
   * @param listener The listener function to call when the event is emitted.
   */
  once(
    eventName: 'unbind',
    listener: <V>(event: ContextViewEvent<V> & {cachedValue?: V}) => void,
  ): this;

  /**
   * The "refresh" event is emitted when the view is refreshed as bindings are
   * added/removed.
   *
   * @param eventName The name of the event - always `refresh`.
   * @param listener The listener function to call when the event is emitted.
   */
  once(eventName: 'refresh', listener: () => void): this;

  /**
   * The "resolve" event is emitted when the cached values are resolved and
   * updated.
   *
   * @param eventName The name of the event - always `refresh`.
   * @param listener The listener function to call when the event is emitted.
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  once(eventName: 'refresh', listener: <V>(result: V[]) => void): this;

  /**
   * The "close" event is emitted when the view is closed (stopped observing
   * context events)
   *
   * @param eventName The name of the event - always `close`.
   * @param listener The listener function to call when the event is emitted.
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  once(eventName: 'close', listener: () => void): this;

  // The generic variant inherited from EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
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
  session?: ResolutionOptionsOrSession,
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
  session?: ResolutionOptionsOrSession,
): Getter<T[]> {
  let bindingComparator: BindingComparator | undefined = undefined;
  if (typeof bindingComparatorOrSession === 'function') {
    bindingComparator = bindingComparatorOrSession;
  } else if (bindingComparatorOrSession instanceof ResolutionSession) {
    session = bindingComparatorOrSession;
  }

  const options = asResolutionOptions(session);
  const view = new ContextView<T>(
    ctx,
    bindingFilter,
    bindingComparator,
    options,
  );
  view.open();
  return view.asGetter(options);
}
