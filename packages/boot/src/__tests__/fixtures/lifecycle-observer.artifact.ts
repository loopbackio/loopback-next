// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {LifeCycleObserver} from '@loopback/core';

/**
 * An mock-up `LifeCycleObserver`. Please note that `start` and `stop` methods
 * can be async or sync.
 */
export class MyLifeCycleObserver implements LifeCycleObserver {
  status = '';

  /**
   * Handling `start` event asynchronously
   */
  async start() {
    // Perform some work asynchronously
    // await startSomeAsyncWork(...)
    this.status = 'started';
  }

  /**
   * Handling `stop` event synchronously.
   */
  stop() {
    this.status = 'stopped';
  }
}
