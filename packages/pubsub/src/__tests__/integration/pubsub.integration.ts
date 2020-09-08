// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/pubsub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {EventEmitter} from 'events';
import {Suite} from 'mocha';
import pEvent from 'p-event';
import {promisify} from 'util';
import {PubSubConnector} from '../..';
import {SubscriberOptions} from '../../types';
const sleep = promisify(setTimeout);

export function testPubSubConnector(
  name: string,
  connector: PubSubConnector,
  subscriberOptions: Partial<SubscriberOptions> = {},
) {
  describe(`${name} pubsub connector`, function (this: Suite) {
    this.timeout(30000);

    before(() => connector.connect());

    after(() => connector.disconnect());

    let events: object[] = [];
    beforeEach(() => {
      events = [];
    });

    it('subscribes to a channel', async () => {
      const {emitter, subscriber} = await subscribe(events);
      const messageArrived = pEvent(emitter, 'message');
      const publisher = await connector.createPublisher({});
      await publisher.publish('test-channel', `${process.pid}-test-message-1`);
      await messageArrived;
      // The broker might have messages from last run
      expect(events).to.containEql({
        channel: 'test-channel',
        message: `${process.pid}-test-message-1`,
      });
      await subscriber.close();
    });

    it('does not consume messages without a subscriber', async () => {
      const publisher = await connector.createPublisher({});
      await publisher.publish('test-channel', `${process.pid}-test-message-2`);
      await sleep(100);
      expect(events).to.not.containEql({
        channel: 'test-channel',
        message: `${process.pid}-test-message-2`,
      });
    });
  });

  async function subscribe(events: object[]) {
    const emitter = new EventEmitter();
    const subscriber = await connector.createSubscriber({
      channels: ['test-channel'],
      ...subscriberOptions,
    });
    subscriber.onMessage((channel, message) => {
      events.push({channel, message});
      setImmediate(() => {
        emitter.emit('message');
      });
    });
    return {emitter, subscriber};
  }
}
