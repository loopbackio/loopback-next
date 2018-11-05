// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  DefaultListenerRegistry,
  ListenerRegistry,
  ListenerFunction,
  EventSource,
  Listener,
} from '../..';

describe('listener registry', () => {
  const source = {};
  const events: string[] = [];
  beforeEach(clearEvents);
  let registry: ListenerRegistry;
  beforeEach(givenObservableRegistry);

  it('subscribes to events', async () => {
    const listener = givenListener();
    registry.subscribe(source, 'starting', listener);
    expect(registry.getListeners(source, 'starting')).containEql(listener);
  });

  it('unsubscribes to events', () => {
    const listener = givenListener();
    registry.subscribe(source, 'starting', listener);
    expect(registry.getListeners(source, 'starting')).containEql(listener);
    registry.unsubscribe(source, 'starting', listener);
    expect(registry.getListeners(source, 'starting')).not.containEql(listener);
  });

  it('cancels subscription', () => {
    const listener = givenListener();
    const subscription = registry.subscribe(source, 'starting', listener);
    expect(registry.getListeners(source, 'starting')).containEql(listener);
    subscription.cancel();
    expect(registry.getListeners(source, 'starting')).not.containEql(listener);
  });

  it('observes to events', async () => {
    const listener = givenListener();
    registry.subscribe(source, 'starting', listener);
    const p1 = registry.emit(source, 'starting', '1');
    // Events are processed asynchronously
    expect(events).to.eql([]);
    // Wait for the promise to be fulfilled in next tick
    await timeout(10);
    expect(events).to.eql(['starting-1']);
    const p2 = registry.emit(source, 'stopping', '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['starting-1']);
    await p1;
    await p2;
  });

  it('observes to events', async () => {
    const listener = givenListenerFunction();
    registry.subscribe(source, 'starting', listener);
    const p1 = registry.emit(source, 'starting', '1');
    // Events are processed asynchronously
    expect(events).to.eql([]);
    // Wait for the promise to be fulfilled in next tick
    await timeout(10);
    expect(events).to.eql(['starting-1']);
    const p2 = registry.emit(source, 'stopping', '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['starting-1']);
    await p1;
    await p2;
  });

  it('notifies listeners', async () => {
    const listener1 = givenListener('A', 10);
    const listener2 = givenListener('B', 0);
    registry.subscribe(source, 'starting', listener1);
    registry.subscribe(source, 'starting', listener2);
    await registry.notify(source, 'starting', '1');
    // A should come 1st
    expect(events).to.eql(['A: starting-1', 'B: starting-1']);
    await registry.notify(source, 'stopping', '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['A: starting-1', 'B: starting-1']);
  });

  it("removes a listener if it's registered using once", async () => {
    const listener1 = givenListener('A', 10);
    const listener2 = givenListener('B', 0);
    registry.once(source, 'starting', listener1);
    registry.subscribe(source, 'starting', listener2);
    expect(registry.getListeners(source, 'starting')).eql([
      listener1,
      listener2,
    ]);
    await registry.notify(source, 'starting', '1');
    expect(registry.getListeners(source, 'starting')).eql([listener2]);
  });

  it('publishes events to listeners in parallel', async () => {
    const listener1 = givenListener('A', 10);
    const listener2 = givenListener('B', 0);
    registry.subscribe(source, 'starting', listener1);
    registry.subscribe(source, 'starting', listener2);
    await registry.emit(source, 'starting', '1');
    // B should come 1st
    expect(events).to.eql(['B: starting-1', 'A: starting-1']);
    await registry.emit(source, 'stopping', '2');
    // The listener is not interested in 'stopping'
    expect(events).to.eql(['B: starting-1', 'A: starting-1']);
  });

  it('creates an event source', () => {
    const eventSource = registry.createEventEmitter(source);
    expect(eventSource).to.be.instanceof(EventSource);
  });

  function givenObservableRegistry() {
    registry = new DefaultListenerRegistry();
    return registry;
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

  function givenListenerFunction(
    name = '',
    wait: number = 0,
  ): ListenerFunction<unknown> {
    const prefix = name ? name + ': ' : '';
    return (event, eventType) => {
      return timeout(wait, () => events.push(`${prefix}${eventType}-${event}`));
    };
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
