// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BoundValue, ValueOrPromise} from './binding';
import {isPromise} from './is-promise';

/**
 * Context provides an implementation of Inversion of Control (IoC) container
 */
export class Context {
  private registry: Map<string, Binding>;

  /**
   * Create a new context
   * @param _parent The optional parent context
   */
  constructor(private _parent?: Context) {
    this.registry = new Map();
  }

  /**
   * Create a binding with the given key in the context. If a locked binding
   * already exists with the same key, an error will be thrown.
   *
   * @param key Binding key
   */
  bind(key: string): Binding {
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
   * Check if a binding exists with the given key in the local context without
   * delegating to the parent context
   * @param key Binding key
   */
  contains(key: string): boolean {
    Binding.validateKey(key);
    return this.registry.has(key);
  }

  /**
   * Check if a key is bound in the context or its ancestors
   * @param key Binding key
   */
  isBound(key: string): boolean {
    if (this.contains(key)) return true;
    if (this._parent) {
      return this._parent.isBound(key);
    }
    return false;
  }

  /**
   * Find bindings using the key pattern
   * @param pattern Key pattern with optional `*` wildcards
   */
  find(pattern?: string): Binding[] {
    let bindings: Binding[] = [];
    if (pattern) {
      // TODO(@superkhau): swap with production grade glob to regex lib
      Binding.validateKey(pattern);
      const glob = new RegExp('^' + pattern.split('*').join('.*') + '$');
      this.registry.forEach(binding => {
        const isMatch = glob.test(binding.key);
        if (isMatch) bindings.push(binding);
      });
    } else {
      bindings = Array.from(this.registry.values());
    }

    const parentBindings = this._parent && this._parent.find(pattern);
    return this._mergeWithParent(bindings, parentBindings);
  }

  /**
   * Find bindings using the tag pattern
   * @param pattern Tag pattern with optional `*` wildcards
   */
  findByTag(pattern: string): Binding[] {
    const bindings: Binding[] = [];
    // TODO(@superkhau): swap with production grade glob to regex lib
    const glob = new RegExp('^' + pattern.split('*').join('.*') + '$');
    this.registry.forEach(binding => {
      const isMatch = Array.from(binding.tags).some(tag => glob.test(tag));
      if (isMatch) bindings.push(binding);
    });

    const parentBindings = this._parent && this._parent.findByTag(pattern);
    return this._mergeWithParent(bindings, parentBindings);
  }

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
   * @returns A promise of the bound value.
   */
  get(key: string): Promise<BoundValue> {
    try {
      return Promise.resolve(this.getValueOrPromise(key));
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
   * @returns A promise of the bound value.
   */
  getSync(key: string): BoundValue {
    const valueOrPromise = this.getValueOrPromise(key);

    if (isPromise(valueOrPromise)) {
      throw new Error(
        `Cannot get ${key} synchronously: the value is a promise`,
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
  getBinding(key: string): Binding {
    Binding.validateKey(key);
    const binding = this.registry.get(key);
    if (binding) {
      return binding;
    }

    if (this._parent) {
      return this._parent.getBinding(key);
    }

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
   * @returns The bound value or a promise of the bound value, depending
   *   on how the binding was configured.
   * @internal
   */
  getValueOrPromise(keyWithPath: string): ValueOrPromise<BoundValue> {
    const {key, path} = Binding.parseKeyWithPath(keyWithPath);
    const boundValue = this.getBinding(key).getValue(this);
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

/**
 * Get nested properties by path
 * @param value Value of an object
 * @param path Path to the property
 */
function getDeepProperty(value: BoundValue, path: string) {
  const props = path.split('.');
  for (const p of props) {
    value = value[p];
    if (value === undefined || value === null) {
      return value;
    }
  }
  return value;
}
