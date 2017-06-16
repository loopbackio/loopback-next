// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BoundValue} from './binding';
import {inject} from './inject';
import {isPromise} from './is-promise';

export class Context {
  private registry: Map<string, Binding>;

  constructor(private _parent?: Context) {
    this.registry = new Map();
  }

  bind(key: string): Binding {
    Binding.validateKey(key);
    key = Binding.normalizeKey(key);
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

  contains(key: string): boolean {
    key = Binding.normalizeKey(key);
    return this.registry.has(key);
  }

  find(pattern?: string): Binding[] {
    let bindings: Binding[] = [];
    if (pattern) {
      // TODO(@superkhau): swap with production grade glob to regex lib
      pattern = Binding.normalizeKey(pattern);
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
      return !childList.some(childBinding =>
        childBinding.key === parentBinding.key);
    });
    return childList.concat(additions);
  }

  get(key: string): Promise<BoundValue> {
    try {
      const path = Binding.getKeyPath(key);
      const binding = this.getBinding(key);
      return Promise.resolve(binding.getValue(this)).then(
        val => getValue(val, path));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getSync(key: string): BoundValue {
    const path = Binding.getKeyPath(key);
    const binding = this.getBinding(key);
    const valueOrPromise = binding.getValue(this);

    if (isPromise(valueOrPromise)) {
      throw new Error(
        `Cannot get ${key} synchronously: the value is a promise`);
    }

    return getValue(valueOrPromise, path);
  }

  getBinding(key: string): Binding {
    key = Binding.normalizeKey(key);
    const binding = this.registry.get(key);
    if (binding) {
      return binding;
    }

    if (this._parent) {
      return this._parent.getBinding(key);
    }

    throw new Error(`The key ${key} was not bound to any value.`);
  }
}

/**
 * Get the value by `.` notation
 * @param obj The source value
 * @param path A path to the nested property, such as `x`, `x.y`, `x.length`,
 * or `x.0`
 */
function getValue(obj: BoundValue, path?: string): BoundValue {
  if (!path) return obj;
  const props = path.split('.');
  let val = undefined;
  for (const p of props) {
    val = obj[p];
    if (val == null) return val;
    obj = val;
  }
  return val;
}
