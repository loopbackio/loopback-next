// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context, inject, Provider} from '@loopback/core';
import {logContexts} from '../util';

export class Counter {
  constructor(public readonly scope: string, public value: number) {}

  inc() {
    this.value++;
  }
}

/**
 * A counter implementation
 */
export class CounterProvider implements Provider<Counter> {
  private readonly counter: Counter;
  constructor(
    // Inject the resolution context and current binding for logging purpose
    @inject.context()
    resolutionCtx: Context,
    @inject.binding()
    private binding: Binding<unknown>,
  ) {
    logContexts(resolutionCtx, binding);
    this.counter = new Counter(`${this.binding.key}@${this.binding.scope}`, 0);
  }

  value() {
    return this.counter;
  }
}
