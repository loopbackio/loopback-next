// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeting-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {CachingService} from '../caching-service';
import {CACHING_SERVICE} from '../keys';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('caching')
export class CacheObserver implements LifeCycleObserver {
  private timer: NodeJS.Timer;
  constructor(
    @inject(CACHING_SERVICE) private cachingService: CachingService,
  ) {}

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    await this.cachingService.start();
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    await this.cachingService.stop();
  }
}
