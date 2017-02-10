// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {Binding} from './binding';

export class Context {
  private registry: Map<string, any>;

  constructor() {
    this.registry = new Map();
  }

  bind(key: string) : Binding {
    const binding = new Binding(key);
    this.registry.set(key, binding);
    return binding;
  }

  contains(key: string) : boolean {
    return this.registry.has(key);
  }

  get(key: string) {
    const binding = this.registry.get(key);
    return binding.value;
  }
}
