// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding} from './binding';
import {BindingKey, BindingAddress} from './binding-key';
import {
  isPromiseLike,
  getDeepProperty,
  ValueOrPromise,
  BoundValue,
} from './value-promise';
import {ResolutionOptions, ResolutionSession} from './resolution-session';

import {v1 as uuidv1} from 'uuid';

import * as debugModule from 'debug';

const debug = debugModule('loopback:context');

/**
 * Context provides an implementation of Inversion of Control (IoC) container
 */
export class Context {
  /**
   * Name of the context
   */
  readonly name: string;
  protected readonly registry: Map<string, Binding> = new Map();
  protected _parent?: Context;

  /**
   * Create a new context
   * @param _parent The optional parent context
   */
  constructor(_parent?: Context | string, name?: string) {
    if (typeof _parent === 'string') {
      name = _parent;
      _parent = undefined;
    }
    this._parent = _parent;
    this.name = name || uuidv1();
  }

  /**
   * Create a binding with the given key in the context. If a locked binding
   * already exists with the same key, an error will be thrown.
   *
   * @param key Binding key
   */
  bind<ValueType = BoundValue>(
    key: BindingAddress<ValueType>,
  ): Binding<ValueType> {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Adding binding: %s', key);
    }
    key = BindingKey.validate(key);
    const keyExists = this.registry.has(key);
    if (keyExists) {
      const existingBinding = this.registry.get(key);
      const bindingIsLocked = existingBinding && existingBinding.isLocked;
      if (bindingIsLocked)
        throw new Error(`Cannot rebind key "${key}" to a locked binding`);
    }

    const binding = new Binding<ValueType>(key);
    this.registry.set(key, binding);
    return binding;
  }

  /**
   * Creates a corresponding binding for `options` (configuration) of the
   * target in the context bound by the key.
   *
   * For example, `ctx.bindOptions('controllers.MyController', {x: 1})` will
   * create binding `controllers.MyController:$options` with `{x: 1}`.
   *
   * @param key The key for the binding that accepts the options
   * @param options Options object
   */
  bindOptions(key: string, options?: BoundValue): Binding {
    const keyForOptions = BindingKey.buildKeyForOptions(key);
    const bindingForOptions = this.bind(keyForOptions);
    if (options != null) {
      bindingForOptions.to(options).tag(`options:${key}`);
    }
    return bindingForOptions;
  }

  /**
   * Resolve options from the binding key hierarchy using namespaces
   * separated by `.`
   *
   * For example, if the binding key is `servers.rest.server1`, we'll try the
   * following entries:
   * 1. servers.rest.server1:$options#host (namespace: server1)
   * 2. servers.rest:$options#server1.host (namespace: rest)
   * 3. servers.$options#rest.server1.host` (namespace: server)
   * 4. $options#servers.rest.server1.host (namespace: '' - root)
   *
   * @param key Binding key with namespaces separated by `.`
   * @param optionPath Property path for the option. For example, `x.y`
   * requests for `options.x.y`. If not set, the `options` object will be
   * returned.
   * @param resolutionOptions Options for the resolution. If `localOnly` is
   * set to true, no parent namespaces will be looked up.
   */
  getOptionsAsValueOrPromise(
    key: string,
    optionPath?: string,
    resolutionOptions?: ResolutionOptions & {localOnly?: boolean},
  ): ValueOrPromise<BoundValue> {
    optionPath = optionPath || '';
    const optionKeyAndPath = BindingKey.create(
      BindingKey.buildKeyForOptions(key),
      optionPath || '',
    );
    let valueOrPromise = this.getValueOrPromise(
      optionKeyAndPath,
      resolutionOptions,
    );

    const checkResult = (val: BoundValue) => {
      // Found the corresponding options
      if (val !== undefined) return val;

      // We have tried all levels
      if (!key) return undefined;

      if (resolutionOptions && resolutionOptions.localOnly) {
        // Local only, not trying parent namespaces
        return undefined;
      }

      // Shift last part of the key into the path as we'll try the parent
      // namespace in the next iteration
      const index = key.lastIndexOf('.');
      optionPath = `${key.substring(index + 1)}.${optionPath}`;
      key = key.substring(0, index);
      // Continue to try the parent namespace
      return this.getOptionsAsValueOrPromise(
        key,
        optionPath,
        resolutionOptions,
      );
    };

    if (isPromiseLike(valueOrPromise)) {
      return valueOrPromise.then(checkResult);
    } else {
      return checkResult(valueOrPromise);
    }
  }

  /**
   * Resolve options from the binding key hierarchy using namespaces
   * separated by `.`
   *
   * For example, if the binding key is `servers.rest.server1`, we'll try the
   * following entries:
   * 1. servers.rest.server1:$options#host (namespace: server1)
   * 2. servers.rest:$options#server1.host (namespace: rest)
   * 3. servers.$options#rest.server1.host` (namespace: server)
   * 4. $options#servers.rest.server1.host (namespace: '' - root)
   *
   * @param key Binding key with namespaces separated by `.`
   * @param optionPath Property path for the option. For example, `x.y`
   * requests for `options.x.y`. If not set, the `options` object will be
   * returned.
   * @param resolutionOptions Options for the resolution. If `localOnly` is
   * set to true, no parent namespaces will be looked up.
   */
  async getOptions(
    key: string,
    optionPath?: string,
    resolutionOptions?: ResolutionOptions & {localOnly?: boolean},
  ): Promise<BoundValue> {
    return await this.getOptionsAsValueOrPromise(
      key,
      optionPath,
      resolutionOptions,
    );
  }

  /**
   * Resolve options synchronously from the binding key hierarchy using
   * namespaces separated by `.`
   *
   * For example, if the binding key is `servers.rest.server1`, we'll try the
   * following entries:
   * 1. servers.rest.server1:$options#host (namespace: server1)
   * 2. servers.rest:$options#server1.host (namespace: rest)
   * 3. servers.$options#rest.server1.host` (namespace: server)
   * 4. $options#servers.rest.server1.host (namespace: '' - root)
   *
   * @param key Binding key with namespaces separated by `.`
   * @param optionPath Property path for the option. For example, `x.y`
   * requests for `options.x.y`. If not set, the `options` object will be
   * returned.
   * @param resolutionOptions Options for the resolution. If `localOnly` is
   * set to true, no parent namespaces will be looked up.
   */
  getOptionsSync(
    key: string,
    optionPath?: string,
    resolutionOptions?: ResolutionOptions & {localOnly?: boolean},
  ): BoundValue {
    const valueOrPromise = this.getOptionsAsValueOrPromise(
      key,
      optionPath,
      resolutionOptions,
    );
    if (isPromiseLike(valueOrPromise)) {
      throw new Error(
        `Cannot get options[${optionPath ||
          ''}] for ${key} synchronously: the value is a promise`,
      );
    }
    return valueOrPromise;
  }

  /**
   * Unbind a binding from the context. No parent contexts will be checked. If
   * you need to unbind a binding owned by a parent context, use the code below:
   * ```ts
   * const ownerCtx = ctx.getOwnerContext(key);
   * return ownerCtx != null && ownerCtx.unbind(key);
   * ```
   * @param key Binding key
   * @returns true if the binding key is found and removed from this context
   */
  unbind<ValueType = BoundValue>(key: BindingAddress<ValueType>): boolean {
    key = BindingKey.validate(key);
    const binding = this.registry.get(key);
    if (binding == null) return false;
    if (binding && binding.isLocked)
      throw new Error(`Cannot unbind key "${key}" of a locked binding`);
    return this.registry.delete(key);
  }

  /**
   * Check if a binding exists with the given key in the local context without
   * delegating to the parent context
   * @param key Binding key
   */
  contains<ValueType = BoundValue>(key: BindingAddress<ValueType>): boolean {
    key = BindingKey.validate(key);
    return this.registry.has(key);
  }

  /**
   * Check if a key is bound in the context or its ancestors
   * @param key Binding key
   */
  isBound<ValueType = BoundValue>(key: BindingAddress<ValueType>): boolean {
    if (this.contains(key)) return true;
    if (this._parent) {
      return this._parent.isBound(key);
    }
    return false;
  }

  /**
   * Get the owning context for a binding key
   * @param key Binding key
   */
  getOwnerContext<ValueType = BoundValue>(
    key: BindingAddress<ValueType>,
  ): Context | undefined {
    if (this.contains(key)) return this;
    if (this._parent) {
      return this._parent.getOwnerContext(key);
    }
    return undefined;
  }

  /**
   * Convert a wildcard pattern to RegExp
   * @param pattern A wildcard string with `*` and `?` as special characters.
   * - `*` matches zero or more characters except `.` and `:`
   * - `?` matches exactly one character except `.` and `:`
   */
  private wildcardToRegExp(pattern: string): RegExp {
    // Escape reserved chars for RegExp:
    // `- \ ^ $ + . ( ) | { } [ ] :`
    let regexp = pattern.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|\:]/g, '\\$&');
    // Replace wildcard chars `*` and `?`
    // `*` matches zero or more characters except `.` and `:`
    // `?` matches one character except `.` and `:`
    regexp = regexp.replace(/\*/g, '[^.:]*').replace(/\?/g, '[^.:]');
    return new RegExp(`^${regexp}$`);
  }

  /**
   * Find bindings using the key pattern
   * @param pattern A regexp or wildcard pattern with optional `*` and `?`. If
   * it matches the binding key, the binding is included. For a wildcard:
   * - `*` matches zero or more characters except `.` and `:`
   * - `?` matches exactly one character except `.` and `:`
   */
  find<ValueType = BoundValue>(
    pattern?: string | RegExp,
  ): Readonly<Binding<ValueType>>[];

  /**
   * Find bindings using a filter function
   * @param filter A function to test on the binding. It returns `true` to
   * include the binding or `false` to exclude the binding.
   */
  find<ValueType = BoundValue>(
    filter: (binding: Readonly<Binding<ValueType>>) => boolean,
  ): Readonly<Binding<ValueType>>[];

  find<ValueType = BoundValue>(
    pattern?:
      | string
      | RegExp
      | ((binding: Readonly<Binding<ValueType>>) => boolean),
  ): Readonly<Binding<ValueType>>[] {
    let bindings: Readonly<Binding>[] = [];
    let filter: (binding: Readonly<Binding>) => boolean;
    if (!pattern) {
      filter = binding => true;
    } else if (typeof pattern === 'string') {
      const regex = this.wildcardToRegExp(pattern);
      filter = binding => regex.test(binding.key);
    } else if (pattern instanceof RegExp) {
      filter = binding => pattern.test(binding.key);
    } else {
      filter = pattern;
    }

    for (const b of this.registry.values()) {
      if (filter(b)) bindings.push(b);
    }

    const parentBindings = this._parent && this._parent.find(filter);
    return this._mergeWithParent(bindings, parentBindings);
  }

  /**
   * Find bindings using the tag pattern
   * @param pattern  A regexp or wildcard pattern with optional `*` and `?`. If
   * it matches one of the binding tags, the binding is included. For a
   * wildcard:
   * - `*` matches zero or more characters except `.` and `:`
   * - `?` matches exactly one character except `.` and `:`
   */
  findByTag<ValueType = BoundValue>(
    pattern: string | RegExp,
  ): Readonly<Binding<ValueType>>[] {
    const regexp =
      typeof pattern === 'string' ? this.wildcardToRegExp(pattern) : pattern;
    return this.find(b => Array.from(b.tags).some(t => regexp.test(t)));
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
   * Get the value bound to the given key, throw an error when no value was
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
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @returns A promise of the bound value.
   */
  get<ValueType>(keyWithPath: BindingAddress<ValueType>): Promise<ValueType>;

  /**
   * Get the value bound to the given key, optionally return a (deep) property
   * of the bound value.
   *
   * @example
   *
   * ```ts
   * // get "rest" property from the value bound to "config"
   * // use "undefined" when not config was provided
   * const config = await ctx.get<RestComponentConfig>('config#rest', {
   *   optional: true
   * });
   * ```
   *
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param optionsOrSession Options or session for resolution. An instance of
   * `ResolutionSession` is accepted for backward compatibility.
   * @returns A promise of the bound value, or a promise of undefined when
   * the optional binding was not found.
   */
  get<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): Promise<ValueType | undefined>;

  // Implementation
  async get<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): Promise<ValueType | undefined> {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Resolving binding: %s', keyWithPath);
    }
    return await this.getValueOrPromise<ValueType | undefined>(
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
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * * @param optionsOrSession Options or session for resolution. An instance of
   * `ResolutionSession` is accepted for backward compatibility.
   * @returns A promise of the bound value.
   */
  getSync<ValueType>(keyWithPath: BindingAddress<ValueType>): ValueType;

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
   * // use "undefined" when no config was provided
   * const config = await ctx.getSync<RestComponentConfig>('config#rest', {
   *   optional: true
   * });
   * ```
   *
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * * @param optionsOrSession Options or session for resolution. An instance of
   * `ResolutionSession` is accepted for backward compatibility.
   * @returns The bound value, or undefined when an optional binding was not found.
   */
  getSync<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): ValueType | undefined;

  // Implementation
  getSync<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): ValueType | undefined {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Resolving binding synchronously: %s', keyWithPath);
    }
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
   * @param key Binding key
   */
  getBinding<ValueType = BoundValue>(
    key: BindingAddress<ValueType>,
  ): Binding<ValueType>;

  /**
   * Look up a binding by key in the context and its ancestors. If no matching
   * binding is found and `options.optional` is not set to true, an error will
   * be thrown.
   *
   * @param key Binding key
   * @param options Options to control if the binding is optional. If
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

    if (options && options.optional) return undefined;
    throw new Error(`The key ${key} was not bound to any value.`);
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
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param optionsOrSession Options for resolution or a session
   * @returns The bound value or a promise of the bound value, depending
   *   on how the binding was configured.
   * @internal
   */
  getValueOrPromise<ValueType>(
    keyWithPath: BindingAddress<ValueType>,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): ValueOrPromise<ValueType | undefined> {
    const {key, propertyPath} = BindingKey.parseKeyWithPath(keyWithPath);

    // backwards compatibility
    if (optionsOrSession instanceof ResolutionSession) {
      optionsOrSession = {session: optionsOrSession};
    }

    const binding = this.getBinding<ValueType>(key, optionsOrSession);
    if (binding == null) return undefined;

    const boundValue = binding.getValue(
      this,
      optionsOrSession && optionsOrSession.session,
    );
    if (propertyPath === undefined || propertyPath === '') {
      return boundValue;
    }

    if (isPromiseLike(boundValue)) {
      return boundValue.then(v => getDeepProperty<ValueType>(v, propertyPath));
    }

    return getDeepProperty<ValueType>(boundValue, propertyPath);
  }

  /**
   * Create a plain JSON object for the context
   */
  toJSON(): Object {
    const json: {[key: string]: Object} = {};
    for (const [k, v] of this.registry) {
      json[k] = v.toJSON();
    }
    return json;
  }
}
