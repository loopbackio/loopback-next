// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {EventType, Listener, EventSourceMixin, AsyncEventEmitter} from '../..';

describe('event source mixin', () => {
  const events: string[] = [];
  beforeEach(clearEvents);
  let eventSource: AsyncEventEmitter;
  beforeEach(givenEventSource);

  it('subscribes to events', async () => {
    const listener = givenListener();
    eventSource.subscribe('starting', listener);
    expect(eventSource.getListeners('starting')).containEql(listener);
  });

  it('unsubscribes to events', () => {
    const listener = givenListener();
    eventSource.subscribe('starting', listener);
    expect(eventSource.getListeners('starting')).containEql(listener);
    eventSource.unsubscribe('starting', listener);
    expect(eventSource.getListeners('starting')).not.containEql(listener);
  });

  it('cancels subscription', () => {
    const listener = givenListener();
    const subscription = eventSource.subscribe('starting', listener);
    expect(eventSource.getListeners('starting')).containEql(listener);
    subscription.cancel();
    expect(eventSource.getListeners('starting')).not.containEql(listener);
  });

  it('observes to events', async () => {
    const listener = givenListener();
    eventSource.subscribe('starting', listener);
    const p1 = eventSource.emit('starting', '1');
    // Events are processed asynchronously
    expect(events).to.eql([]);
    // Wait for the promise to be fulfilled in next tick
    await timeout(10);
    expect(events).to.eql(['starting-1']);
    const p2 = eventSource.emit('stopping', '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['starting-1']);
    await p1;
    await p2;
  });

  it('notifies listeners', async () => {
    const STARTING = EventType.create<string>('starting');
    const STOPPING = EventType.create<string>('stopping');
    const listener1 = givenListener('A', 10);
    const listener2 = givenListener('B', 0);
    eventSource.subscribe(STARTING, listener1);
    eventSource.subscribe(STARTING, listener2);
    await eventSource.notify(STARTING, '1');
    // A should come 1st
    expect(events).to.eql(['A: starting-1', 'B: starting-1']);
    await eventSource.notify(STOPPING, '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['A: starting-1', 'B: starting-1']);
  });

  it('publishes events to listeners in parallel', async () => {
    const listener1 = givenListener('A', 10);
    const listener2 = givenListener('B', 0);
    eventSource.subscribe('starting', listener1);
    eventSource.subscribe('starting', listener2);
    await eventSource.emit('starting', '1');
    // B should come 1st
    expect(events).to.eql(['B: starting-1', 'A: starting-1']);
    await eventSource.emit('stopping', '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['B: starting-1', 'A: starting-1']);
  });

  class MyService {}
  class MyExtentSource extends EventSourceMixin(MyService) {}

  function givenEventSource() {
    eventSource = new MyExtentSource();
  }

  function givenListener(name = '', wait: number = 0) {
    const prefix = name ? name + ': ' : '';
    const listener: Listener = {
      name,
      listen: (event, eventType) => {
        return timeout(wait, () =>
          events.push(`${prefix}${eventType}-${event}`),
        );
      },
    };
    return listener;
  }

  function timeout(ms: number, fn?: () => void) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (fn) fn();
        resolve();
      }, ms);
    });
  }

  function clearEvents() {
    events.splice(0, events.length);
  }
});
