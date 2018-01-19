// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {map, takeUntil, reduce} from './iteratable';
import {Binding} from './binding';
import {
  isPromise,
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
   * Registry of bindings
   */
  protected readonly registry: Map<string, Binding> = new Map();

  /**
   * Create a new context
   * @param parents The optional parent contexts. If multiple parent contexts
   * are provided, they will be used to resolve bindings following breadth first
   * traversal.
   * @name name The optional context name. If not present, a uuid is generated as
   * the name.
   */
  constructor(parents?: Context | Context[] | string, name?: string) {
    if (typeof parents === 'string') {
      // constructor(name)
      name = parents;
      parents = undefined;
    }
    if (Array.isArray(parents)) {
      this.parents.push(...parents);
    } else if (parents) {
      this.parents.push(parents);
    }
    this.name = name || uuidv1();
  }

  /**
   * Create a binding with the given key in the context. If a locked binding
   * already exists with the same key, an error will be thrown.
   *
   * @param key Binding key
   */
  bind(key: string): Binding {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Adding binding: %s', key);
    }
    Binding.validateKey(key);
    const keyExists = this.registry.has(key);
    if (keyExists) {
      const existingBinding = this.registry.get(key);
      const bindingIsLocked = existingBinding && existingBinding.isLocked;
      if (bindingIsLocked)
        throw new Error(`Cannot rebind key "${key}" to a locked binding`);
    }

    const binding = new Binding(key);
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
  unbind(key: string): boolean {
    Binding.validateKey(key);
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
  contains(key: string): boolean {
    Binding.validateKey(key);
    return this.registry.has(key);
  }

  /**
   * Iterate all contexts by breadth first traversal of the graph following
   * `parents`. For example, with the following context graph:
   * - reqCtx -> [serverCtx, connectorCtx]
   * - serverCtx -> [appCtx]
   * - connectorCtx -> [appCtx]
   * `reqCtx.contexts()` returns an iterator of `[reqCtx, serverCtx,
   * connectorCtx, appCtx]`.
   */
  protected *contexts(): IterableIterator<Context> {
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
      yield c;
      // Enqueue the parent contexts
      queue.push(...c.parents);
    }
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
        map(this.contexts(), mapper),
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
  isBound(key: string): boolean {
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
  getOwnerContext(key: string): Context | undefined {
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
  composeWith(parents?: Context | Context[], name?: string): this {
    // Construct a new instance with the same class of this instance
    const ctor = this.constructor as Constructor<this>;
    const copy = new ctor(parents, name);
    // Add this context as the 1st parent for the new one
    copy.parents.unshift(this);
    return copy;
  }

  /**
   * Find bindings using the key pattern
   * @param pattern Key regexp or pattern with optional `*` wildcards
   */
  find(pattern?: string | RegExp): Binding[] {
    const mapper = (ctx: Context) => {
      let bindings: Binding[] = [];
      let glob: RegExp | undefined = undefined;
      if (typeof pattern === 'string') {
        // TODO(@superkhau): swap with production grade glob to regex lib
        Binding.validateKey(pattern);
        glob = new RegExp('^' + pattern.split('*').join('.*') + '$');
      } else if (pattern instanceof RegExp) {
        glob = pattern;
      }
      if (glob) {
        ctx.registry.forEach(binding => {
          const isMatch = glob!.test(binding.key);
          if (isMatch) bindings.push(binding);
        });
      } else {
        bindings = Array.from(ctx.registry.values());
      }
      return bindings;
    };
    return this.visitAllContexts<Binding[], Binding[]>(
      mapper,
      () => false,
      (bindings, parentBindings) =>
        this._mergeWithParent(bindings, parentBindings),
      [],
    );
  }

  /**
   * Find bindings using the tag pattern
   * @param pattern Tag name regexp or pattern with optional `*` wildcards
   */
  findByTag(pattern: string | RegExp): Binding[] {
    const mapper = (ctx: Context) => {
      const bindings: Binding[] = [];
      // TODO(@superkhau): swap with production grade glob to regex lib
      const glob =
        typeof pattern === 'string'
          ? new RegExp('^' + pattern.split('*').join('.*') + '$')
          : pattern;
      ctx.registry.forEach(binding => {
        const isMatch = Array.from(binding.tags).some(tag => glob.test(tag));
        if (isMatch) bindings.push(binding);
      });
      return bindings;
    };

    return this.visitAllContexts<Binding[], Binding[]>(
      mapper,
      () => false,
      (bindings, parentBindings) =>
        this._mergeWithParent(bindings, parentBindings),
      [],
    );
  }

  /**
   * Merge bindings from a parent context with those from a child context.
   * For bindings with the same key, the one from the child will be kept.
   * @param childList An array of bindings from the child
   * @param parentList An array of bindings from the parent
   */
  protected _mergeWithParent(childList: Binding[], parentList?: Binding[]) {
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
   * Get the value bound to the given key, optionally return a (deep) property
   * of the bound value.
   *
   * @example
   *
   * ```ts
   * // get the value bound to "application.instance"
   * const app = await ctx.get('application.instance');
   *
   * // get "rest" property from the value bound to "config"
   * const config = await ctx.getValueOrPromise('config#rest');
   *
   * // get "a" property of "numbers" property from the value bound to "data"
   * ctx.bind('data').to({numbers: {a: 1, b: 2}, port: 3000});
   * const a = await ctx.get('data#numbers.a');
   * ```
   *
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param optionsOrSession Options or session for resolution. An instance of
   * `ResolutionSession` is accepted for backward compatibility.
   * @returns A promise of the bound value.
   */
  get(
    keyWithPath: string,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): Promise<BoundValue> {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Resolving binding: %s', keyWithPath);
    }
    try {
      return Promise.resolve(
        this.getValueOrPromise(keyWithPath, optionsOrSession),
      );
    } catch (err) {
      return Promise.reject(err);
    }
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
   * const app = ctx.get('application.instance');
   *
   * // get "rest" property from the value bound to "config"
   * const config = ctx.getValueOrPromise('config#rest');
   * ```
   *
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * * @param optionsOrSession Options or session for resolution. An instance of
   * `ResolutionSession` is accepted for backward compatibility.
   * @returns A promise of the bound value.
   */
  getSync(
    keyWithPath: string,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): BoundValue {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Resolving binding synchronously: %s', keyWithPath);
    }
    const valueOrPromise = this.getValueOrPromise(
      keyWithPath,
      optionsOrSession,
    );

    if (isPromise(valueOrPromise)) {
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
  getBinding(key: string): Binding;

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
  getBinding(key: string, options?: {optional?: boolean}): Binding | undefined;

  getBinding(key: string, options?: {optional?: boolean}): Binding | undefined {
    Binding.validateKey(key);
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
   * ctx.getValueOrPromise('application.instance');
   *
   * // get "rest" property from the value bound to "config"
   * ctx.getValueOrPromise('config#rest');
   *
   * // get "a" property of "numbers" property from the value bound to "data"
   * ctx.bind('data').to({numbers: {a: 1, b: 2}, port: 3000});
   * ctx.getValueOrPromise('data#numbers.a');
   * ```
   *
   * @param keyWithPath The binding key, optionally suffixed with a path to the
   *   (deeply) nested property to retrieve.
   * @param optionsOrSession Options for resolution or a session
   * @returns The bound value or a promise of the bound value, depending
   *   on how the binding was configured.
   * @internal
   */
  getValueOrPromise(
    keyWithPath: string,
    optionsOrSession?: ResolutionOptions | ResolutionSession,
  ): ValueOrPromise<BoundValue> {
    const {key, path} = Binding.parseKeyWithPath(keyWithPath);
    if (optionsOrSession instanceof ResolutionSession) {
      optionsOrSession = {session: optionsOrSession};
    }
    const binding = this.getBinding(key, optionsOrSession);
    if (binding == null) return undefined;
    const boundValue = binding.getValue(
      this,
      optionsOrSession && optionsOrSession.session,
    );
    if (path === undefined || path === '') {
      return boundValue;
    }

    if (isPromise(boundValue)) {
      return boundValue.then(v => getDeepProperty(v, path));
    }

    return getDeepProperty(boundValue, path);
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
