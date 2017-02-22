// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {Binding} from './binding';

export class Context {
  private registry: Map<string, Binding>;

  constructor() {
    this.registry = new Map();
  }

  bind(key: string): Binding {
    const keyExists = this.registry.has(key);
    const bindingIsLocked = this.registry.get(key) && this.registry.get(key).isLocked;

    if (keyExists && bindingIsLocked)
      throw new Error(`Cannot rebind key "${key}", associated binding is locked`);

    const binding = new Binding(key);
    this.registry.set(key, binding);
    return binding;
  }

  contains(key: string): boolean {
    return this.registry.has(key);
  }

  find(pattern: string): Binding[] {
    let bindings = [];
    if (pattern) {
      // TODO: swap with production grade glob to regex lib
      const glob = new RegExp('^' + pattern.split('*').join('.*') + '$');
      this.registry.forEach(binding => {
        const isMatch = glob.test(binding.key);
        if (isMatch)
          bindings.push(binding);
      });
    } else {
      bindings = Array.from(this.registry.values());
    }

    return bindings;
  }

  get(key: string) {
    const binding = this.registry.get(key);
    return binding && binding.isDynamic ?
      binding.value() :
      binding.value;
  }
}
