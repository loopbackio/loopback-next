// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* eslint-disable @typescript-eslint/no-explicit-any */
import {ValueOrPromise} from '@loopback/context';

export type MessageHandler = (
  channel: string,
  message: any,
) => ValueOrPromise<void>;

export interface PublisherOptions {
  [name: string]: any;
}

export interface SubscriberOptions {
  channels: string[];
  [name: string]: any;
}

export interface PubSubConnector {
  /**
   * Connect to the PubSub broker
   */
  connect(): ValueOrPromise<void>;
  /**
   * Disconnect from the PubSub broker
   */
  disconnect(): ValueOrPromise<void>;

  supportsWildcard(): boolean;

  /**
   * Create a publisher
   * @param options Options for the publisher
   */
  createPublisher(options: PublisherOptions): Promise<Publisher>;

  /**
   * Create a subscriber
   * @param options - Options for the subscriber
   */
  createSubscriber(options: SubscriberOptions): Promise<Subscriber>;
}

/**
 * Message publisher
 */
export interface Publisher {
  publish(channel: string, message: any): Promise<void>;
}

/**
 * Message subscriber
 */
export interface Subscriber {
  close(): Promise<void>;
  onMessage(handler: MessageHandler): void;
}
