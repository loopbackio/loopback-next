// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory, {Debugger} from 'debug';
import {EventEmitter} from 'events';
import {
  Binding,
  BindingInspectOptions,
  BindingScope,
  BindingTag,
} from './binding';
import {
  ConfigurationResolver,
  DefaultConfigurationResolver,
} from './binding-config';
import {
  BindingFilter,
  filterByKey,
  filterByTag,
  isBindingTagFilter,
} from './binding-filter';
import {BindingAddress, BindingKey} from './binding-key';
import {BindingComparator} from './binding-sorter';
import {ContextEvent, ContextEventListener} from './context-event';
import {ContextEventObserver, ContextObserver} from './context-observer';
import {ContextSubscriptionManager, Subscription} from './context-subscription';
import {ContextTagIndexer} from './context-tag-indexer';
import {ContextView} from './context-view';
import {JSONObject} from './json-types';
import {ContextBindings} from './keys';
import {
  asResolutionOptions,
  ResolutionError,
  ResolutionOptions,
  ResolutionOptionsOrSession,
  ResolutionSession,
} from './resolution-session';
import {generateUniqueId} from './unique-id';
import {
  BoundValue,
  Constructor,
  getDeepProperty,
  isPromiseLike,
  transformValueOrPromise,
  ValueOrPromise,
} from './value-promise';

/**
 * Context provides an implementation of Inversion of Control (IoC) container
 */
export class Context extends EventEmitter {
  /**
   * Name of the context
   */
  readonly name: string;

  /**
   * Key to binding map as the internal registry
   */
  protected readonly registry: Map<string, Binding> = new Map();

  /**
   * Indexer for bindings by tag
   */
  protected readonly tagIndexer: ContextTagIndexer;

  /**
   * Manager for observer subscriptions
   */
  readonly subscriptionManager: ContextSubscriptionManager;

  /**
   * Parent context
   */
  protected _parent?: Context;

  /**
   * Configuration resolver
   */
  protected configResolver: ConfigurationResolver;

  /**
   * A debug function which can be overridden by subclasses.
   *
   * @example
   * ```ts
   * import debugFactory from 'debug';
   * const debug = debugFactory('loopback:context:application');
   * export class Application extends Context {
   *   super('application');
   *   this._debug = debug;
   * }
   * ```
   */
  protected _debug: Debugger;

  /**
   * Scope for binding resolution
   */
  scope: BindingScope = BindingScope.CONTEXT;

  /**
   * Create a new context.
   *
   * @example
   * ```ts
   * // Create a new root context, let the framework to create a unique name
   * const rootCtx = new Context();
   *
   * // Create a new child context inheriting bindings from `rootCtx`
   * const childCtx = new Context(rootCtx);
   *
   * // Create another root context called "application"
   * const appCtx = new Context('application');
   *
   * // Create a new child context called "request" and inheriting bindings
   * // from `appCtx`
   * const reqCtx = new Context(appCtx, 'request');
   * ```
   * @param _parent - The optional parent context
   * @param name - Name of the context. If not provided, a unique identifier
   * will be generated as the name.
   */
  constructor(_parent?: Context | string, name?: string) {
    super();
    // The number of listeners can grow with the number of child contexts
    // For example, each request can add a listener to the RestServer and the
    // listener is removed when the request processing is finished.
    // See https://github.com/loopbackio/loopback-next/issues/4363
    this.setMaxListeners(Infinity);
    if (typeof _parent === 'string') {
      name = _parent;
      _parent = undefined;
    }
    this._parent = _parent;
    this.name = name ?? this.generateName();
    this.tagIndexer = new ContextTagIndexer(this);
    this.subscriptionManager = new ContextSubscriptionManager(this);
    this._debug = debugFactory(this.getDebugNamespace());
  }

  /**
   * Get the debug namespace for the context class. Subclasses can override
   * this method to supply its own namespace.
   *
   * @example
   * ```ts
   * export class Application extends Context {
   *   super('application');
   * }
   *
   * protected getDebugNamespace() {
   *   return 'loopback:context:application';
   * }
   * ```
   */
  protected getDebugNamespace() {
    if (this.constructor === Context) return 'loopback:context';
    const name = this.constructor.name.toLowerCase();
    return `loopback:context:${name}`;
  }

  private generateName() {
    const id = generateUniqueId();
    if (this.constructor === Context) return id;
    return `${this.constructor.name}-${id}`;
  }

  /**
   * @internal
   * Getter for ContextSubscriptionManager
   */
  get parent() {
    return this._parent;
  }

  /**
   * Wrap the debug statement so that it always print out the context name
   * as the prefix
   * @param args - Arguments for the debug
   */
  protected debug(...args: unknown[]) {
    /* istanbul ignore if */
    if (!this._debug.enabled) return;
    const formatter = args.shift();
    if (typeof formatter === 'string') {
      this._debug(`[%s] ${formatter}`, this.name, ...args);
    } else {
      this._debug('[%s] ', this.name, formatter, ...args);
    }
  }

  /**
   * A strongly-typed method to emit context events
   * @param type Event type
   * @param event Context event
   */
  emitEvent<T extends ContextEvent>(type: string, event: T) {
    this.emit(type, event);
  }

  /**
   * Emit an `error` event
   * @param err Error
   */
  emitError(err: unknown) {
    this.emit('error', err);
  }

  /**
   * Create a binding with the given key in the context. If a locked binding
   * already exists with the same key, an error will be thrown.
   *
   * @param key - Binding key
   */
  bind<ValueType = BoundValue>(
    key: BindingAddress<ValueType>,
  ): Binding<ValueType> {
    const binding = new Binding<ValueType>(key.toString());
    this.add(binding);
    return binding;
  }

  /**
   * Add a binding to the context. If a locked binding already exists with the
   * same key, an error will be thrown.
   * @param binding - The configured binding to be added
   */
  add(binding: Binding<unknown>): this {
    const key = binding.key;
    this.debug('[%s] Adding binding: %s', key);
    let existingBinding: Binding | undefined;
    const keyExists = this.registry.has(key);
    if (keyExists) {
      existingBinding = this.registry.get(key);
      const bindingIsLocked = existingBinding?.isLocked;
      if (bindingIsLocked)
        throw new Error(`Cannot rebind key "${key}" to a locked binding`);
    }
    this.registry.set(key, binding);
    if (existingBinding !== binding) {
      if (existingBinding != null) {
        this.emitEvent('unbind', {
          binding: existingBinding,
          context: this,
          type: 'unbind',
        });
      }
      this.emitEvent('bind', {binding, context: this, type: 'bind'});
    }
    return this;
  }

  /**
   * Create a corresponding binding for configuration of the target bound by
   * the given key in the context.
   *
   * For example, `ctx.configure('controllers.MyController').to({x: 1})` will
   * create binding `controllers.MyController:$config` with value `{x: 1}`.
   *
   * @param key - The key for the binding to be configured
   */
  configure<ConfigValueType = BoundValue>(
    key: BindingAddress = '',
  ): Binding<ConfigValueType> {
    const bindingForConfig = Binding.configure<ConfigValueType>(key);
    this.add(bindingForConfig);
    return bindingForConfig;
  }

  /**
   * Get the value or promise of configuration for a given binding by key
   *
   * @param key - Binding key
   * @param propertyPath - Property path for the option. For example, `x.y`
   * requests for `<config>.x.y`. If not set, the `<config>` object will be
   * returned.
   * @param resolutionOptions - Options for the resolution.
   * - optional: if not set or set to `true`, `undefined` will be returned if
   * no corresponding value is found. Otherwise, an error will be thrown.
   */
  getConfigAsValueOrPromise<ConfigValueType>(
    key: BindingAddress,
    propertyPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): ValueOrPromise<ConfigValueType | undefined> {
    this.setupConfigurationResolverIfNeeded();
    return this.configResolver.getConfigAsValueOrPromise(
      key,
      propertyPath,
      resolutionOptions,
    );
  }

  /**
   * Set up the configuration resolver if needed
   */
  protected setupConfigurationResolverIfNeeded() {
    if (!this.configResolver) {
      // First try the bound ConfigurationResolver to this context
      const configResolver = this.getSync<ConfigurationResolver>(
        ContextBindings.CONFIGURATION_RESOLVER,
        {
          optional: true,
        },
      );
      if (configResolver) {
        this.debug(
          'Custom ConfigurationResolver is loaded from %s.',
          ContextBindings.CONFIGURATION_RESOLVER.toString(),
        );
        this.configResolver = configResolver;
      } else {
        // Fallback to DefaultConfigurationResolver
        this.debug('DefaultConfigurationResolver is used.');
        this.configResolver = new DefaultConfigurationResolver(this);
      }
    }
    return this.configResolver;
  }

  /**
   * Resolve configuration for the binding by key
   *
   * @param key - Binding key
   * @param propertyPath - Property path for the option. For example, `x.y`
   * requests for `<config>.x.y`. If not set, the `<config>` object will be
   * returned.
   * @param resolutionOptions - Options for the resolution.
   */
  async getConfig<ConfigValueType>(
    key: BindingAddress,
    propertyPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): Promise<ConfigValueType | undefined> {
    return this.getConfigAsValueOrPromise<ConfigValueType>(
      key,
      propertyPath,
      resolutionOptions,
    );
  }

  /**
   * Resolve configuration synchronously for the binding by key
   *
   * @param key - Binding key
   * @param propertyPath - Property path for the option. For example, `x.y`
   * requests for `config.x.y`. If not set, the `config` object will be
   * returned.
   * @param resolutionOptions - Options for the resolution.
   */
  getConfigSync<ConfigValueType>(
    key: BindingAddress,
    propertyPath?: string,
    resolutionOptions?: ResolutionOptions,
  ): ConfigValueType | undefined {
    const valueOrPromise = this.getConfigAsValueOrPromise<ConfigValueType>(
      key,
      propertyPath,
      resolutionOptions,
    );
    if (isPromiseLike(valueOrPromise)) {
      const prop = propertyPath ? ` property ${propertyPath}` : '';
      throw new Error(
        `Cannot get config${prop} for ${key} synchronously: the value is a promise`,
      );
    }
    return valueOrPromise;
  }

  /**
   * Unbind a binding from the context. No parent contexts will be checked.
   *
   * @remarks
   * If you need to unbind a binding owned by a parent context, use the code
   * below:
   *
   * ```ts
   * const ownerCtx = ctx.getOwnerContext(key);
   * return ownerCtx != null && ownerCtx.unbind(key);
   * ```
   *
   * @param key - Binding key
   * @returns true if the binding key is found and removed from this context
   */
  unbind(key: BindingAddress): boolean {
    this.debug('Unbind %s', key);
    key = BindingKey.validate(key);
    const binding = this.registry.get(key);
    // If not found, return `false`
    if (binding == null) return false;
    if (binding?.isLocked)
      throw new Error(`Cannot unbind key "${key}" of a locked binding`);
    this.registry.delete(key);
    this.emitEvent('unbind', {binding, context: this, type: 'unbind'});
    return true;
  }

  /**
   * Add a context event observer to the context
   * @param observer - Context observer instance or function
   */
  subscribe(observer: ContextEventObserver): Subscription {
    return this.subscriptionManager.subscribe(observer);
  }

  /**
   * Remove the context event observer from the context
   * @param observer - Context event observer
   */
  unsubscribe(observer: ContextEventObserver): boolean {
    return this.subscriptionManager.unsubscribe(observer);
  }

  /**
   * Close the context: clear observers, stop notifications, and remove event
   * listeners from its parent context.
   *
   * @remarks
   * This method MUST be called to avoid memory leaks once a context object is
   * no longer needed and should be recycled. An example is the `RequestContext`,
   * which is created per request.
   */
  close() {
    this.debug('Closing context...');
    this.subscriptionManager.close();
    this.tagIndexer.close();
  }

  /**
   * Check if an observer is subscribed to this context
   * @param observer - Context observer
   */
  isSubscribed(observer: ContextObserver) {
    return this.subscriptionManager.isSubscribed(observer);
  }

  /**
   * Create a view of the context chain with the given binding filter
   * @param filter - A function to match bindings
   * @param comparator - A function to sort matched bindings
   * @param options - Resolution options
   */
  createView<T = unknown>(
    filter: BindingFilter,
    comparator?: BindingComparator,
    options?: Omit<ResolutionOptions, 'session'>,
  ) {
    const view = new ContextView<T>(this, filter, comparator, options);
    view.open();
    return view;
  }

  /**
   * Check if a binding exists with the given key in the local context without
   * delegating to the parent context
   * @param key - Binding key
   */
  contains(key: BindingAddress): boolean {
    key = BindingKey.validate(key);
    return this.registry.has(key);
  }

  /**
   * Check if a key is bound in the context or its ancestors
   * @param key - Binding key
   */
  isBound(key: BindingAddress): boolean {
    if (this.contains(key)) return true;
    if (this._parent) {
      return this._parent.isBound(key);
    }
    return false;
  }

  /**
   * Get the owning context for a binding or its key
   * @param keyOrBinding - Binding object or key
   */
  getOwnerContext(
    keyOrBinding: BindingAddress | Readonly<Binding<unknown>>,
  ): Context | undefined {
    let key: BindingAddress;
    if (keyOrBinding instanceof Binding) {
      key = keyOrBinding.key;
    } else {
      key = keyOrBinding as BindingAddress;
    }
    if (this.contains(key)) {
      if (keyOrBinding instanceof Binding) {
        // Check if the contained binding is the same
        if (this.registry.get(key.toString()) === keyOrBinding) {
          return this;
        }
        return undefined;
      }
      return this;
    }
    if (this._parent) {
      return this._parent.getOwnerContext(key);
    }
    return undefined;
  }

  /**
   * Get the context matching the scope
   * @param scope - Binding scope
   */
  getScopedContext(
    scope:
      | BindingScope.APPLICATION
      | BindingScope.SERVER
      | BindingScope.REQUEST,
  ): Context | undefined {
    if (this.scope === scope) return this;
    if (this._parent) {
      return this._parent.getScopedContext(scope);
    }
    return undefined;
  }

  /**
   * Locate the resolution context for the given binding. Only bindings in the
   * resolution context and its ancestors are visible as dependencies to resolve
   * the given binding
   * @param binding - Binding object
   */
  getResolutionContext(
    binding: Readonly<Binding<unknown>>,
  ): Context | undefined {
    let resolutionCtx: Context | undefined;
    switch (binding.scope) {
      case BindingScope.SINGLETON:
        // Use the owner context
        return this.getOwnerContext(binding.key);
      case BindingScope.TRANSIENT:
      case BindingScope.CONTEXT:
        // Use the current context
        return this;
      case BindingScope.REQUEST:
        resolutionCtx = this.getScopedContext(binding.scope);
        if (resolutionCtx != null) {
          return resolutionCtx;
        } else {
          // If no `REQUEST` scope exists in the chain, fall back to the current
          // context
          this.debug(
            'No context is found for binding "%s (scope=%s)". Fall back to the current context.',
            binding.key,
            binding.scope,
          );
          return this;
        }
      default:
        // Use the scoped context
        return this.getScopedContext(binding.scope);
    }
  }

  /**
   * Check if this context is visible (same or ancestor) to the given one
   * @param ctx - Another context object
   */
  isVisibleTo(ctx: Context) {
    let current: Context | undefined = ctx;
    while (current != null) {
      if (current === this) return true;
      current = current._parent;
    }
    return false;
  }

  /**
   * Find bindings using a key pattern or filter function
   * @param pattern - A filter function, a regexp or a wildcard pattern with
   * optional `*` and `?`. Find returns such bindings where the key matches
   * the provided pattern.
   *
   * For a wildcard:
   * - `*` matches zero or more characters except `.` and `:`
   * - `?` matches exactly one character except `.` and `:`
   *
   * For a filter function:
   * - return `true` to include the binding in the results
   * - return `false` to exclude it.
   */
  find<ValueType = BoundValue>(
    pattern?: string | RegExp | BindingFilter,
  ): Readonly<Binding<ValueType>>[] {
    // Optimize if the binding filter is for tags
    if (typeof pattern === 'function' && isBindingTagFilter(pattern)) {
      return this._findByTagIndex(pattern.bindingTagPattern);
    }

    const bindings: Readonly<Binding<ValueType>>[] = [];
    const filter = filterByKey(pattern);

    for (const b of this.registry.values()) {
      if (filter(b)) bindings.push(b);
    }

    const parentBindings = this._parent?.find(filter);
    return this._mergeWithParent(bindings, parentBindings);
  }

  /**
   * Find bindings using the tag filter. If the filter matches one of the
   * binding tags, the binding is included.
   *
   * @param tagFilter - A filter for tags. It can be in one of the following
   * forms:
   * - A regular expression, such as `/controller/`
   * - A wildcard pattern string with optional `*` and `?`, such as `'con*'`
   *   For a wildcard:
   *   - `*` matches zero or more characters except `.` and `:`
   *   - `?` matches exactly one character except `.` and `:`
   * - An object containing tag name/value pairs, such as
   * `{name: 'my-controller'}`
   */
  findByTag<ValueType = BoundValue>(
    tagFilter: BindingTag | RegExp,
  ): Readonly<Binding<ValueType>>[] {
    return this.find(filterByTag(tagFilter));
  }

  /**
   * Find bindings by tag leveraging indexes
   * @param tag - Tag name pattern or name/value pairs
   */
  protected _findByTagIndex<ValueType = BoundValue>(
    tag: BindingTag | RegExp,
  ): Readonly<Binding<ValueType>>[] {
    const currentBindings = this.tagIndexer.findByTagIndex(tag);
    const parentBindings = this._parent?._findByTagIndex(tag);
    return this._mergeWithParent(currentBindings, parentBindings);
  }

  protected _mergeWithParent<ValueType>(
    childList: Readonly<Binding<ValueType>>[],
    parentList?: Readonly<Binding<ValueType>>[],
  ) {
    if (!parentList) return childList;
    const additions = parentList.filter(parentBinding => {
      // children bindings take precedence
      return !childList.some(
        childBinding => childBinding.key === parentBinding.key,
      );
    });
    return childList.concat(additions);
  }

  /**
   * Get the value bound to the given key, throw an error when no value is
   * bound for the given key.
   *
   * @example
   *
   * ```ts
   * // get the value bound to "application.instance"
   * const app = await ctx.get<Application>('application.instance');
   *
   * // get "rest" property from the value bound to "config"
   * const config = await ctx.get<RestComponentConfig>('config#rest');
   *
   * // get "a" property of "numbers" property from the value bound to "data"
   * ctx.bind('data').to({numbers: {a: 1, b: 2}, port: 3000});
   * const a = await ctx.get<number>('data#numbers.a');
   * ```
   *
   * @param keyWithPath - The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param session - Optional session for resolution (accepted for backward
   * compatibility)
   * @returns A promise of the bound value.
   */
  get<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    session?: ResolutionSession,
  ): Promise<ValueType>;

  /**
   * Get the value bound to the given key, optionally return a (deep) property
   * of the bound value.
   *
   * @example
   *
   * ```ts
   * // get "rest" property from the value bound to "config"
   * // use `undefined` when no config is provided
   * const config = await ctx.get<RestComponentConfig>('config#rest', {
   *   optional: true
   * });
   * ```
   *
   * @param keyWithPath - The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param options - Options for resolution.
   * @returns A promise of the bound value, or a promise of undefined when
   * the optional binding is not found.
   */
  get<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    options: ResolutionOptions,
  ): Promise<ValueType | undefined>;

  // Implementation
  async get<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptionsOrSession,
  ): Promise<ValueType | undefined> {
    this.debug('Resolving binding: %s', keyWithPath);
    return this.getValueOrPromise<ValueType | undefined>(
      keyWithPath,
      optionsOrSession,
    );
  }

  /**
   * Get the synchronous value bound to the given key, optionally
   * return a (deep) property of the bound value.
   *
   * This method throws an error if the bound value requires async computation
   * (returns a promise). You should never rely on sync bindings in production
   * code.
   *
   * @example
   *
   * ```ts
   * // get the value bound to "application.instance"
   * const app = ctx.getSync<Application>('application.instance');
   *
   * // get "rest" property from the value bound to "config"
   * const config = await ctx.getSync<RestComponentConfig>('config#rest');
   * ```
   *
   * @param keyWithPath - The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param session - Session for resolution (accepted for backward compatibility)
   * @returns A promise of the bound value.
   */
  getSync<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    session?: ResolutionSession,
  ): ValueType;

  /**
   * Get the synchronous value bound to the given key, optionally
   * return a (deep) property of the bound value.
   *
   * This method throws an error if the bound value requires async computation
   * (returns a promise). You should never rely on sync bindings in production
   * code.
   *
   * @example
   *
   * ```ts
   * // get "rest" property from the value bound to "config"
   * // use "undefined" when no config is provided
   * const config = await ctx.getSync<RestComponentConfig>('config#rest', {
   *   optional: true
   * });
   * ```
   *
   * @param keyWithPath - The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param options - Options for resolution.
   * @returns The bound value, or undefined when an optional binding is not found.
   */
  getSync<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    options?: ResolutionOptions,
  ): ValueType | undefined;

  // Implementation
  getSync<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptionsOrSession,
  ): ValueType | undefined {
    this.debug('Resolving binding synchronously: %s', keyWithPath);

    const valueOrPromise = this.getValueOrPromise<ValueType>(
      keyWithPath,
      optionsOrSession,
    );

    if (isPromiseLike(valueOrPromise)) {
      throw new Error(
        `Cannot get ${keyWithPath} synchronously: the value is a promise`,
      );
    }

    return valueOrPromise;
  }

  /**
   * Look up a binding by key in the context and its ancestors. If no matching
   * binding is found, an error will be thrown.
   *
   * @param key - Binding key
   */
  getBinding<ValueType = BoundValue>(
    key: BindingAddress<ValueType>,
  ): Binding<ValueType>;

  /**
   * Look up a binding by key in the context and its ancestors. If no matching
   * binding is found and `options.optional` is not set to true, an error will
   * be thrown.
   *
   * @param key - Binding key
   * @param options - Options to control if the binding is optional. If
   * `options.optional` is set to true, the method will return `undefined`
   * instead of throwing an error if the binding key is not found.
   */
  getBinding<ValueType>(
    key: BindingAddress<ValueType>,
    options?: {optional?: boolean},
  ): Binding<ValueType> | undefined;

  getBinding<ValueType>(
    key: BindingAddress<ValueType>,
    options?: {optional?: boolean},
  ): Binding<ValueType> | undefined {
    key = BindingKey.validate(key);
    const binding = this.registry.get(key);
    if (binding) {
      return binding;
    }

    if (this._parent) {
      return this._parent.getBinding<ValueType>(key, options);
    }

    if (options?.optional) return undefined;
    throw new Error(
      `The key '${key}' is not bound to any value in context ${this.name}`,
    );
  }

  /**
   * Find or create a binding for the given key
   * @param key - Binding address
   * @param policy - Binding creation policy
   */
  findOrCreateBinding<T>(
    key: BindingAddress<T>,
    policy?: BindingCreationPolicy,
  ) {
    let binding: Binding<T>;
    if (policy === BindingCreationPolicy.ALWAYS_CREATE) {
      binding = this.bind(key);
    } else if (policy === BindingCreationPolicy.NEVER_CREATE) {
      binding = this.getBinding(key);
    } else if (this.isBound(key)) {
      // CREATE_IF_NOT_BOUND - the key is bound
      binding = this.getBinding(key);
    } else {
      // CREATE_IF_NOT_BOUND - the key is not bound
      binding = this.bind(key);
    }
    return binding;
  }

  /**
   * Get the value bound to the given key.
   *
   * This is an internal version that preserves the dual sync/async result
   * of `Binding#getValue()`. Users should use `get()` or `getSync()` instead.
   *
   * @example
   *
   * ```ts
   * // get the value bound to "application.instance"
   * ctx.getValueOrPromise<Application>('application.instance');
   *
   * // get "rest" property from the value bound to "config"
   * ctx.getValueOrPromise<RestComponentConfig>('config#rest');
   *
   * // get "a" property of "numbers" property from the value bound to "data"
   * ctx.bind('data').to({numbers: {a: 1, b: 2}, port: 3000});
   * ctx.getValueOrPromise<number>('data#numbers.a');
   * ```
   *
   * @param keyWithPath - The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param optionsOrSession - Options for resolution or a session
   * @returns The bound value or a promise of the bound value, depending
   *   on how the binding is configured.
   * @internal
   */
  getValueOrPromise<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptionsOrSession,
  ): ValueOrPromise<ValueType | undefined> {
    const {key, propertyPath} = BindingKey.parseKeyWithPath(keyWithPath);

    const options = asResolutionOptions(optionsOrSession);

    const binding = this.getBinding<ValueType>(key, {optional: true});
    if (binding == null) {
      if (options.optional) return undefined;
      throw new ResolutionError(
        `The key '${key}' is not bound to any value in context ${this.name}`,
        {
          context: this,
          binding: Binding.bind(key),
          options,
        },
      );
    }

    const boundValue = binding.getValue(this, options);
    return propertyPath == null || propertyPath === ''
      ? boundValue
      : transformValueOrPromise(boundValue, v =>
          getDeepProperty<ValueType>(v, propertyPath),
        );
  }

  /**
   * Create a plain JSON object for the context
   */
  toJSON(): JSONObject {
    const bindings: JSONObject = {};
    for (const [k, v] of this.registry) {
      bindings[k] = v.toJSON();
    }
    return bindings;
  }

  /**
   * Inspect the context and dump out a JSON object representing the context
   * hierarchy
   * @param options - Options for inspect
   */
  // TODO(rfeng): Evaluate https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects
  inspect(options: ContextInspectOptions = {}): JSONObject {
    return this._inspect(options, new ClassNameMap());
  }

  /**
   * Inspect the context hierarchy
   * @param options - Options for inspect
   * @param visitedClasses - A map to keep class to name so that we can have
   * different names for classes with colliding names. The situation can happen
   * when two classes with the same name are bound in different modules.
   */
  private _inspect(
    options: ContextInspectOptions,
    visitedClasses: ClassNameMap,
  ): JSONObject {
    options = {
      includeParent: true,
      includeInjections: false,
      ...options,
    };
    const bindings: JSONObject = {};
    for (const [k, v] of this.registry) {
      const ctor = v.valueConstructor ?? v.providerConstructor;
      let name: string | undefined = undefined;
      if (ctor != null) {
        name = visitedClasses.visit(ctor);
      }
      bindings[k] = v.inspect(options);
      if (name != null) {
        const binding = bindings[k] as JSONObject;
        if (v.valueConstructor) {
          binding.valueConstructor = name;
        } else if (v.providerConstructor) {
          binding.providerConstructor = name;
        }
      }
    }
    const json: JSONObject = {
      name: this.name,
      bindings,
    };
    if (!options.includeParent) return json;
    if (this._parent) {
      json.parent = this._parent._inspect(options, visitedClasses);
    }
    return json;
  }

  /**
   * The "bind" event is emitted when a new binding is added to the context.
   * The "unbind" event is emitted when an existing binding is removed.
   *
   * @param eventName The name of the event - always `bind` or `unbind`.
   * @param listener The listener function to call when the event is emitted.
   */
  on(eventName: 'bind' | 'unbind', listener: ContextEventListener): this;

  // The generic variant inherited from EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * The "bind" event is emitted when a new binding is added to the context.
   * The "unbind" event is emitted when an existing binding is removed.
   *
   * @param eventName The name of the event - always `bind` or `unbind`.
   * @param listener The listener function to call when the event is emitted.
   */
  once(eventName: 'bind' | 'unbind', listener: ContextEventListener): this;

  // The generic variant inherited from EventEmitter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}

/**
 * An internal utility class to handle class name conflicts
 */
class ClassNameMap {
  private readonly classes = new Map<Constructor<unknown>, string>();
  private readonly nameIndex = new Map<string, number>();

  visit(ctor: Constructor<unknown>) {
    let name = this.classes.get(ctor);
    if (name == null) {
      name = ctor.name;
      // Now check if the name collides with another class
      let index = this.nameIndex.get(name);
      if (typeof index === 'number') {
        // A conflict is found, mangle the name as `ClassName #1`
        this.nameIndex.set(name, ++index);
        name = `${name} #${index}`;
      } else {
        // The name is used for the 1st time
        this.nameIndex.set(name, 0);
      }
      this.classes.set(ctor, name);
    }
    return name;
  }
}

/**
 * Options for context.inspect()
 */
export interface ContextInspectOptions extends BindingInspectOptions {
  /**
   * The flag to control if parent context should be inspected
   */
  includeParent?: boolean;
}

/**
 * Policy to control if a binding should be created for the context
 */
export enum BindingCreationPolicy {
  /**
   * Always create a binding with the key for the context
   */
  ALWAYS_CREATE = 'Always',
  /**
   * Never create a binding for the context. If the key is not bound in the
   * context, throw an error.
   */
  NEVER_CREATE = 'Never',
  /**
   * Create a binding if the key is not bound in the context. Otherwise, return
   * the existing binding.
   */
  CREATE_IF_NOT_BOUND = 'IfNotBound',
}
