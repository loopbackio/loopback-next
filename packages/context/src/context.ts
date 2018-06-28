// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, TagMap} from './binding';
import {BindingKey, BindingAddress} from './binding-key';
import {map, takeUntil, reduce} from './iteratable';
import {
  isPromiseLike,
  BoundValue,
  Constructor,
  ValueOrPromise,
  getDeepProperty,
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
  /**
   * Parent contexts to form a graph of contexts for binding resolution
   */
  protected readonly parents: Context[] = [];

  /**
   * Cached contexts for delegation
   */
  private contexts: Context[];

  /**
   * Registry of bindings
   */
  protected readonly registry: Map<string, Binding> = new Map();

  /**
   * Create a new context
   * @param parent The optional parent contexts.
   * @name name The optional context name. If not present, a uuid is generated
   * as the name.
   */
  constructor(parent?: Context | string, name?: string) {
    if (typeof parent === 'string') {
      // constructor(name)
      name = parent;
      parent = undefined;
    }
    if (parent) {
      this.parents.push(parent);
    }
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
   * Iterate all contexts by breadth first traversal of the graph following
   * `parents`. For example, with the following context graph:
   * - reqCtx -> [serverCtx, connectorCtx]
   * - serverCtx -> [appCtx]
   * - connectorCtx -> [appCtx]
   * `reqCtx.getAllContexts()` returns an iterator of `[reqCtx, serverCtx,
   * connectorCtx, appCtx]`.
   */
  protected getAllContexts(): Context[] {
    if (this.contexts) return this.contexts;
    this.contexts = [];
    const visited: Set<Context> = new Set();
    const queue: Context[] = [];
    // Enqueue the current context
    queue.push(this);
    while (queue.length) {
      // Dequeue the head context
      const c = queue.shift()!;
      // Skip a context if it has been visited
      if (visited.has(c)) continue;
      visited.add(c);
      this.contexts.push(c);
      // Enqueue the parent contexts
      queue.push(...c.parents);
    }
    return this.contexts;
  }

  /**
   * Visit all contexts in the graph to resolve values following the context
   * chain connected by `parents`.
   *
   * @param mapper A function to produce a result from the context object
   * locally without consulting the parents
   * @param predicator A function to control when the iteration stops
   * @param reducer A function to reduce the previous result and current value
   * into a new result
   * @param initialValue The initial result
   */
  protected visitAllContexts<T, V>(
    mapper: (ctx: Context) => T,
    predicator: (value: T) => boolean,
    reducer: (accumulator: V, currentValue: T) => V,
    initialValue: V,
  ): V {
    return reduce(
      // Iterate until the predicator returns `true`
      takeUntil(
        // Visit a context to produce a result locally
        map(this.getAllContexts(), mapper),
        predicator,
      ),
      reducer,
      initialValue,
    );
  }

  /**
   * Check if a key is bound in the context or its ancestors
   * @param key Binding key
   */
  isBound<ValueType = BoundValue>(key: BindingAddress<ValueType>): boolean {
    return this.visitAllContexts(
      ctx => ctx.contains(key),
      value => value === true,
      (accumulator, currentValue) => currentValue,
      false,
    );
  }

  /**
   * Get the owning context for a binding key
   * @param key Binding key
   */
  getOwnerContext<ValueType = BoundValue>(
    key: BindingAddress<ValueType>,
  ): Context | undefined {
    return this.visitAllContexts<Context, Context | undefined>(
      ctx => ctx,
      value => value.contains(key),
      (accumulator, currentValue) => currentValue,
      undefined,
    );
  }

  /**
   * Compose this context with additional parent contexts. The newly created
   * context will have this context and the provided parent contexts as its
   * parents.
   * @param parents Optional parent contexts to be added to the graph
   * @param name Name of the newly composed context
   */
  composeWith(parents: Context | Context[], name?: string): this {
    // Construct a new instance with the same class of this instance
    const ctor = this.constructor as Constructor<this>;
    const copy = new ctor(this, name);

    if (Array.isArray(parents)) {
      copy.parents.push(...parents);
    } else {
      copy.parents.push(parents);
    }
    return copy;
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

    const mapper = (ctx: Context) => {
      const bindings: Readonly<Binding>[] = [];
      ctx.registry.forEach(binding => {
        const isMatch = filter(binding);
        if (isMatch) bindings.push(binding);
      });
      return bindings;
    };
    return this.visitAllContexts<Readonly<Binding>[], Readonly<Binding>[]>(
      mapper,
      () => false,
      (bindings, parentBindings) =>
        this._mergeWithParent(bindings, parentBindings),
      [],
    );
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
    tagFilter: string | RegExp | TagMap,
  ): Readonly<Binding<ValueType>>[] {
    if (typeof tagFilter === 'string' || tagFilter instanceof RegExp) {
      const regexp =
        typeof tagFilter === 'string'
          ? this.wildcardToRegExp(tagFilter)
          : tagFilter;
      return this.find(b => Array.from(b.tagNames).some(t => regexp!.test(t)));
    }

    return this.find(b => {
      for (const t in tagFilter) {
        // One tag name/value does not match
        if (b.tagMap[t] !== tagFilter[t]) return false;
      }
      // All tag name/value pairs match
      return true;
    });
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
   * @param options Options to control if the binding is optional. If
   * `options.optional` is set to true, the method will return `undefined`
   * instead of throwing an error if the binding key is not found.
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

  getBinding(key: string, options?: {optional?: boolean}): Binding | undefined {
    BindingKey.validate(key);
    const result = this.visitAllContexts<
      Binding | undefined,
      Binding | undefined
    >(
      ctx => ctx.registry.get(key),
      binding => binding != null,
      (accumulator, currentValue) => currentValue,
      undefined,
    );
    if ((options && options.optional) || result != null) return result;
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
