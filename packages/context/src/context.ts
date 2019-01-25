// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugModule from 'debug';
import {v1 as uuidv1} from 'uuid';
import {ValueOrPromise} from '.';
import {Binding, BindingTag} from './binding';
import {BindingAddress, BindingKey} from './binding-key';
import {ResolutionOptions, ResolutionSession} from './resolution-session';
import {BoundValue, getDeepProperty, isPromiseLike} from './value-promise';
import {BindingFilter, filterByKey, filterByTag} from './binding-filter';

const debug = debugModule('loopback:context');

/**
 * Context provides an implementation of Inversion of Control (IoC) container
 */
export class Context {
  /**
   * Name of the context
   */
  readonly name: string;

  /**
   * Key to binding map as the internal registry
   */
  protected readonly registry: Map<string, Binding> = new Map();

  /**
   * Parent context
   */
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
    const binding = new Binding<ValueType>(key.toString());
    this.add(binding);
    return binding;
  }

  /**
   * Add a binding to the context. If a locked binding already exists with the
   * same key, an error will be thrown.
   * @param binding The configured binding to be added
   */
  add(binding: Binding<unknown>): this {
    const key = binding.key;
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Adding binding: %s', key);
    }

    const keyExists = this.registry.has(key);
    if (keyExists) {
      const existingBinding = this.registry.get(key);
      const bindingIsLocked = existingBinding && existingBinding.isLocked;
      if (bindingIsLocked)
        throw new Error(`Cannot rebind key "${key}" to a locked binding`);
    }
    this.registry.set(key, binding);
    return this;
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
  unbind(key: BindingAddress): boolean {
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
  contains(key: BindingAddress): boolean {
    key = BindingKey.validate(key);
    return this.registry.has(key);
  }

  /**
   * Check if a key is bound in the context or its ancestors
   * @param key Binding key
   */
  isBound(key: BindingAddress): boolean {
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
  getOwnerContext(key: BindingAddress): Context | undefined {
    if (this.contains(key)) return this;
    if (this._parent) {
      return this._parent.getOwnerContext(key);
    }
    return undefined;
  }

  /**
   * Find bindings using the key pattern
   * @param pattern A filter function, a regexp or a wildcard pattern with
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
    const bindings: Readonly<Binding>[] = [];
    const filter = filterByKey(pattern);

    for (const b of this.registry.values()) {
      if (filter(b)) bindings.push(b);
    }

    const parentBindings = this._parent && this._parent.find(filter);
    return this._mergeWithParent(bindings, parentBindings);
  }

  /**
   * Find bindings using the tag filter. If the filter matches one of the
   * binding tags, the binding is included.
   *
   * @param tagFilter  A filter for tags. It can be in one of the following
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
