// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import IORedis from 'ioredis';
import {Redis, RedisOptions} from 'ioredis';
import {MessageHandler, Publisher, PubSubConnector, Subscriber} from '../..';
import {PublisherOptions, SubscriberOptions} from '../../types';

const debug = debugFactory('loopback:pubsub:redis');

/* eslint-disable @typescript-eslint/no-explicit-any */

export class RedisPubSubConnector implements PubSubConnector {
  private redis: Redis;
  private connections: Set<Redis> = new Set();

  constructor(private redisOptions: RedisOptions = {}) {
    this.redis = new IORedis({...redisOptions, lazyConnect: true});
    this.connections.add(this.redis);
  }

  async connect() {
    await this.redis.connect();
    debug('Redis connected', this.redisOptions);
  }

  async disconnect() {
    for (const connection of this.connections) {
      await this.releaseConnection(connection);
    }
    debug('Redis disconnected', this.redisOptions);
  }

  acquireConnection() {
    const connection = this.redis.duplicate();
    this.connections.add(connection);
    return connection;
  }

  async releaseConnection(connection: Redis) {
    await connection.quit();
    this.connections.delete(connection);
  }

  supportsWildcard() {
    return true;
  }

  /**
   * Create a publisher
   * @param options Options for the publisher
   */
  async createPublisher(options: PublisherOptions): Promise<Publisher> {
    return new RedisPublisher(this.redis);
  }

  /**
   * Create a subscriber
   * @param channel - Channel/topic
   * @param options - Options for the subscriber
   */
  async createSubscriber(options: SubscriberOptions): Promise<Subscriber> {
    debug('Subscribing to channels: %s', options.channels.join(', '));
    const connection = this.acquireConnection();
    const subscriber = new RedisSubscriber(this, connection, options.channels);
    await connection.subscribe(...options.channels);
    debug('Subscribed to channels: %s', options.channels.join(', '));
    return subscriber;
  }
}

class RedisPublisher implements Publisher {
  constructor(private connection: Redis) {}
  async publish(channel: string, message: any): Promise<void> {
    debug('Publishing to channel %s', channel, message);
    await this.connection.publish(channel, message);
    debug('Published to channel %s', channel, message);
  }
}

class RedisSubscriber implements Subscriber {
  closed = false;

  constructor(
    private connector: RedisPubSubConnector,
    private connection: Redis,
    private channels: string[],
  ) {}

  async close() {
    if (this.closed) return;
    debug('Closing subscriber');
    await this.connection.unsubscribe(...this.channels);
    await this.connector.releaseConnection(this.connection);
    this.closed = true;
    debug('Subscriber closed');
  }

  onMessage(handler: MessageHandler) {
    this.connection.on('message', (channel: string, message: any) => {
      debug('Message received from channel %s:', channel, message);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handler(channel, message);
    });
  }
}
