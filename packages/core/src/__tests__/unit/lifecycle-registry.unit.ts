// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  BindingScope,
  Context,
  createBindingFromClass,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {promisify} from 'util';
import {
  asLifeCycleObserver,
  CoreBindings,
  CoreTags,
  LifeCycleObserver,
  LifeCycleObserverRegistry,
} from '../..';
import {DEFAULT_ORDERED_GROUPS} from '../../lifecycle-registry';
const sleep = promisify(setTimeout);

describe('LifeCycleRegistry', () => {
  let context: Context;
  let registry: TestObserverRegistry;
  const events: string[] = [];

  beforeEach(() => events.splice(0, events.length));
  beforeEach(givenContext);
  beforeEach(givenLifeCycleRegistry);

  it('starts all registered observers', async () => {
    givenObserver('1');
    givenObserver('2');
    await registry.start();
    expect(events).to.eql(['1-start', '2-start']);
  });

  it('starts all registered async observers', async () => {
    givenAsyncObserver('1', 'g1');
    givenAsyncObserver('2', 'g2');
    registry.setOrderedGroups(['g1', 'g2']);
    await registry.start();
    expect(events).to.eql(['1-start', '2-start']);
  });

  it('stops all registered observers in reverse order', async () => {
    givenObserver('1');
    givenObserver('2');
    await registry.stop();
    expect(events).to.eql(['2-stop', '1-stop']);
  });

  it('stops all registered async observers in reverse order', async () => {
    givenAsyncObserver('1', 'g1');
    givenAsyncObserver('2', 'g2');
    registry.setOrderedGroups(['g1', 'g2']);
    await registry.stop();
    expect(events).to.eql(['2-stop', '1-stop']);
  });

  it('starts all registered observers by group', async () => {
    givenObserver('1', 'g1');
    givenObserver('2', 'g2');
    givenObserver('3', 'g1');
    registry.setOrderedGroups(['g1', 'g2']);
    const groups = registry.getOrderedGroups();
    expect(groups).to.eql(['g1', 'g2']);
    await registry.start();
    expect(events).to.eql(['1-start', '3-start', '2-start']);
  });

  it('stops all registered observers in reverse order by group', async () => {
    givenObserver('1', 'g1');
    givenObserver('2', 'g2');
    givenObserver('3', 'g1');
    registry.setOrderedGroups(['g1', 'g2']);
    await registry.stop();
    expect(events).to.eql(['2-stop', '3-stop', '1-stop']);
  });

  it('starts observers by alphabetical groups if no order is configured', async () => {
    givenObserver('1', 'g1');
    givenObserver('2', 'g2');
    givenObserver('3', 'g1');
    givenObserver('4', 'g0');
    const groups = registry.getOrderedGroups();
    expect(groups).to.eql(['g0', 'g1', 'g2']);
    await registry.start();
    expect(events).to.eql(['4-start', '1-start', '3-start', '2-start']);
  });

  it('runs all registered observers within the same group in parallel', async () => {
    // 1st group: g1-1 takes 20 ms more than g1-2 to finish
    givenAsyncObserver('g1-1', 'g1', 20);
    givenAsyncObserver('g1-2', 'g1', 0);

    // 2nd group: g2-1 takes 20 ms more than g2-2 to finish
    givenAsyncObserver('g2-1', 'g2', 20);
    givenAsyncObserver('g2-2', 'g2', 0);

    registry.setOrderedGroups(['g1', 'g2']);
    registry.setParallel(true);
    await registry.start();
    expect(events.length).to.equal(4);

    // 1st group: g1-1, g1-2
    const group1 = events.slice(0, 2);
    expect(group1.sort()).to.eql(['g1-1-start', 'g1-2-start']);

    // 2nd group: g2-1, g2-2
    const group2 = events.slice(2, 4);
    expect(group2.sort()).to.eql(['g2-1-start', 'g2-2-start']);
  });

  it('runs all registered observers within the same group in serial', async () => {
    // 1st group: g1-1 takes 20 ms more than g1-2 to finish
    givenAsyncObserver('g1-1', 'g1', 20);
    givenAsyncObserver('g1-2', 'g1', 0);

    // 2nd group: g2-1 takes 20 ms more than g2-2 to finish
    givenAsyncObserver('g2-1', 'g2', 20);
    givenAsyncObserver('g2-2', 'g2', 0);

    registry.setOrderedGroups(['g1', 'g2']);
    registry.setParallel(false);
    await registry.start();
    expect(events.length).to.equal(4);
    expect(events).to.eql([
      'g1-1-start',
      'g1-2-start',
      'g2-1-start',
      'g2-2-start',
    ]);
  });

  function givenContext() {
    context = new Context('app');
  }

  /**
   * Create a subclass to expose some protected properties/methods for testing
   */
  class TestObserverRegistry extends LifeCycleObserverRegistry {
    getOrderedGroups(): string[] {
      return super.getObserverGroupsByOrder().map(g => g.group);
    }

    setParallel(parallel?: boolean) {
      this.options.parallel = parallel;
    }
  }

  async function givenLifeCycleRegistry() {
    context.bind(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS).to({
      orderedGroups: DEFAULT_ORDERED_GROUPS,
      parallel: false,
    });
    context
      .bind(CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY)
      .toClass(TestObserverRegistry)
      .inScope(BindingScope.SINGLETON);
    registry = (await context.get(
      CoreBindings.LIFE_CYCLE_OBSERVER_REGISTRY,
    )) as TestObserverRegistry;
  }

  function givenObserver(name: string, group = '') {
    @bind({tags: {[CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: group}})
    class MyObserver implements LifeCycleObserver {
      start() {
        events.push(`${name}-start`);
      }
      stop() {
        events.push(`${name}-stop`);
      }
    }
    const binding = createBindingFromClass(MyObserver, {
      key: `observers.observer-${name}`,
    }).apply(asLifeCycleObserver);
    context.add(binding);

    return MyObserver;
  }

  function givenAsyncObserver(name: string, group = '', delayInMs = 0) {
    @bind({tags: {[CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: group}})
    class MyAsyncObserver implements LifeCycleObserver {
      async start() {
        await sleep(delayInMs);
        events.push(`${name}-start`);
      }
      async stop() {
        await sleep(delayInMs);
        events.push(`${name}-stop`);
      }
    }
    const binding = createBindingFromClass(MyAsyncObserver, {
      key: `observers.observer-${name}`,
    }).apply(asLifeCycleObserver);
    context.add(binding);

    return MyAsyncObserver;
  }
});
