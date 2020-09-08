// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, ValueOrPromise} from '@loopback/core';
import {PubSub, PubSubEngine} from 'graphql-subscriptions';
import {PubSubBindings} from './keys';
import {
  MessageHandler,
  Publisher,
  PublisherOptions,
  PubSubConnector,
  Subscriber,
  SubscriberOptions,
} from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class GraphQLPubSubConnector implements PubSubConnector {
  constructor(
    @inject(PubSubBindings.ENGINE)
    readonly pubsubEngine: PubSubEngine = new PubSub(),
  ) {}

  connect(): ValueOrPromise<void> {
    return;
  }

  disconnect(): ValueOrPromise<void> {
    return;
  }

  supportsWildcard(): boolean {
    throw new Error('Method not implemented.');
  }

  async createPublisher(options: PublisherOptions): Promise<Publisher> {
    return new GraphQLPublisher(this.pubsubEngine);
  }

  async createSubscriber(options: SubscriberOptions): Promise<Subscriber> {
    const channels = [...options.channels];
    const subIds: number[] = [];
    const subscriber = new GraphQLSubscriber(
      channels,
      subIds,
      this.pubsubEngine,
    );
    for (const channel of channels) {
      const subId = await this.pubsubEngine.subscribe(
        channel,
        async (message: any) => {
          for (const handler of subscriber.handlers) {
            await handler(channel, message);
          }
        },
        options,
      );
      subscriber.subIds.push(subId);
    }

    return subscriber;
  }

  publish(channel: string, message: any): Promise<void> {
    return this.pubsubEngine.publish(channel, message);
  }
}

class GraphQLPublisher implements Publisher {
  constructor(readonly pubsubEngine: PubSubEngine) {}
  publish(channel: string, message: any): Promise<void> {
    return this.pubsubEngine.publish(channel, message);
  }
}

class GraphQLSubscriber implements Subscriber {
  readonly handlers: MessageHandler[] = [];

  constructor(
    readonly channels: string[],
    readonly subIds: number[],
    readonly pubsubEngine: PubSubEngine,
  ) {}

  async close(): Promise<void> {
    for (const id of this.subIds) {
      await this.pubsubEngine.unsubscribe(id);
    }
  }

  onMessage(handler: MessageHandler): void {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  }
}
