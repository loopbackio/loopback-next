// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {
  ConsumerGroup,
  ConsumerGroupOptions,
  HighLevelProducer,
  KafkaClient,
  KafkaClientOptions,
  ProduceRequest,
} from 'kafka-node';
import pEvent from 'p-event';
import {MessageHandler, Publisher, PubSubConnector, Subscriber} from '../..';
import {PublisherOptions, SubscriberOptions} from '../../types';

const debug = debugFactory('loopback:pubsub:kafka');

/* eslint-disable @typescript-eslint/no-explicit-any */

export class KafkaPubSubConnector implements PubSubConnector {
  private kafka: KafkaClient;

  constructor(private kafkaOptions: KafkaClientOptions = {}) {
    this.kafka = new KafkaClient(kafkaOptions);
  }

  async connect() {
    debug('Connecting to Kafka', this.kafkaOptions);
    this.kafka.connect();
    await pEvent(this.kafka, 'ready');
    debug('Kafka connected', this.kafkaOptions);
  }

  disconnect() {
    debug('Disconnecting from Kafka', this.kafkaOptions);
    return new Promise<void>((resolve, reject) => {
      this.kafka.close(() => {
        debug('Kafka disconnected', this.kafkaOptions);
        resolve();
      });
    });
  }

  supportsWildcard() {
    return true;
  }

  /**
   * Create a publisher
   * @param options Options for the publisher
   */
  async createPublisher(options: PublisherOptions): Promise<Publisher> {
    debug('Creating Kafka producer', this.kafkaOptions);
    const producer = new HighLevelProducer(this.kafka, options);
    // If the kafka client is already connected, the producer is marked is
    // `ready` synchronously
    if (!(producer as any).ready) {
      await pEvent(producer, 'ready');
    }
    debug('Kafka producer is now ready', this.kafkaOptions);
    return new KafkaPublisher(producer);
  }

  /**
   * Create a subscriber
   * @param channel - Channel/topic
   * @param options - Options for the subscriber
   */
  async createSubscriber(options: SubscriberOptions): Promise<Subscriber> {
    const consumerGroupOptions: ConsumerGroupOptions = {
      groupId: options.groupId || 'LoopBack',
      fromOffset: undefined,
      ...options,
      kafkaHost: this.kafkaOptions.kafkaHost,
    };

    debug(
      'Subscribing to channels: %s',
      options.channels.join(', '),
      consumerGroupOptions,
    );
    const consumer = new ConsumerGroup(consumerGroupOptions, options.channels);
    return new KafkaSubscriber(consumer);
  }
}

class KafkaPublisher implements Publisher {
  constructor(private producer: HighLevelProducer) {}

  publish(channel: string, message: any): Promise<void> {
    debug('Publishing to channel %s', channel, message);
    const req: ProduceRequest = {topic: channel, messages: [message]};
    return new Promise<any>((resolve, reject) => {
      this.producer.send([req], (err, data) => {
        debug('Message published to channel %s', channel, message);
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

class KafkaSubscriber implements Subscriber {
  constructor(private consumer: ConsumerGroup) {}

  closed = false;

  async close() {
    if (this.closed) return;
    await new Promise<any>((resolve, reject) => {
      debug('Closing subscriber');
      this.consumer.close(true, err => {
        if (err) reject(err);
        else resolve();
      });
    });
    this.closed = true;
    debug('Subscriber closed');
  }

  onMessage(handler: MessageHandler) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.consumer.on('message', async message => {
      debug('Message received', message);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      await handler(message.topic, message.value);
      debug('Message processed', message);
    });
  }
}
