// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ContextEventObserver, Subscription} from './context-observer';

/**
 * An implementation of `Subscription` interface for context events
 */
export class ContextSubscription implements Subscription {
  constructor(
    protected notifier: {unsubscribe(observer: ContextEventObserver): boolean},
    protected observer: ContextEventObserver,
  ) {}

  private _closed = false;

  unsubscribe() {
    this.notifier.unsubscribe(this.observer);
    this._closed = true;
  }

  get closed() {
    return this._closed;
  }
}
