// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeting-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope, config, ContextView} from '@loopback/core';
import * as debugFactory from 'debug';
import {Message} from './types';
const debug = debugFactory('greeter-extension');

/**
 * Configuration for CachingService
 */
export interface CachingServiceOptions {
  // The time-to-live setting for a cache entry
  ttl: number;
}

/**
 * Message caching service
 */
@bind({scope: BindingScope.SINGLETON})
export class CachingService {
  private timer: NodeJS.Timer;
  private store: Map<string, Message> = new Map();

  constructor(
    @config.view()
    private optionsView: ContextView<CachingServiceOptions>,
  ) {
    // Use a view so that we can listen on `refresh` events, which are emitted
    // when the configuration binding is updated in the context.
    optionsView.on('refresh', () => {
      debug('Restarting the service as configuration changes...');
      this.restart().catch(err => {
        console.error('Cannot restart the caching service.', err);
        process.exit(1);
      });
    });
  }

  // We intentionally mark all operations `async` to reflect the commonly used
  // caching infrastructure even though our in-memory implementation is based
  // on a `Map` that provides synchronous APIs.
  /**
   * Store a message in the cache
   * @param key - Key for caching
   * @param message - Message
   */
  async set(key: string, message: Message) {
    this.store.set(key, message);
  }

  /**
   * Load a message from the cache by key
   * @param key - Key for caching
   */
  async get(key: string) {
    const expired = await this.isExpired(key);
    debug('Getting cache for %s', key, expired);
    return expired ? undefined : this.store.get(key);
  }

  /**
   * Delete a message from the cache by key
   * @param key - Key for caching
   */
  async delete(key: string) {
    return this.store.delete(key);
  }

  /**
   * Clear the cache
   */
  async clear() {
    this.store.clear();
  }

  /**
   * Check if the cached item is expired by key
   * @param key - Key for caching
   * @param now - The current date
   */
  async isExpired(key: string, now = new Date()): Promise<boolean> {
    const ttl = await this.getTTL();
    const msg = this.store.get(key);
    if (!msg) return true;
    return now.getTime() - msg.timestamp.getTime() > ttl;
  }

  /**
   * Get the TTL setting
   */
  async getTTL() {
    const options = await this.optionsView.singleValue();
    debug('Caching options: %j', options);
    return (options && options.ttl) || 5000;
  }

  /**
   * Remove expired items from the cache
   */
  async sweep() {
    debug('Sweeping cache...');
    for (const key of this.store.keys()) {
      if (await this.isExpired(key)) {
        debug('Cache for %s is swept.', key);
        await this.delete(key);
      }
    }
  }

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    debug('Starting caching service');
    await this.clear();
    const ttl = await this.getTTL();
    debug('TTL: %d', ttl);
    this.timer = setInterval(() => {
      this.sweep().catch(console.warn);
    }, ttl);
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    debug('Stopping caching service');
    /* istanbul ignore if */
    if (this.timer) {
      clearInterval(this.timer);
    }
    await this.clear();
  }

  /**
   * This method may be used to restart the service (and may be triggered by a
   * 'refresh' event)
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }
}
