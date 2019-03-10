// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, ContextView, filterByTag, Getter, inject} from '../..';

let app: Context;
let server: Context;

describe('@inject.* to receive multiple values matching a filter', async () => {
  const workloadMonitorFilter = filterByTag('workloadMonitor');
  beforeEach(givenWorkloadMonitors);

  it('injects as getter', async () => {
    class MyControllerWithGetter {
      @inject.getter(workloadMonitorFilter)
      getter: Getter<number[]>;
    }

    server.bind('my-controller').toClass(MyControllerWithGetter);
    const inst = await server.get<MyControllerWithGetter>('my-controller');
    const getter = inst.getter;
    expect(await getter()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    givenWorkloadMonitor(server, 'server-reporter-2', 7);
    // The getter picks up the new binding
    expect(await getter()).to.eql([3, 7, 5]);
  });

  describe('@inject', () => {
    class MyControllerWithValues {
      constructor(
        @inject(workloadMonitorFilter)
        public values: number[],
      ) {}
    }

    it('injects as values', async () => {
      server.bind('my-controller').toClass(MyControllerWithValues);
      const inst = await server.get<MyControllerWithValues>('my-controller');
      expect(inst.values).to.eql([3, 5]);
    });

    it('injects as values that can be resolved synchronously', () => {
      server.bind('my-controller').toClass(MyControllerWithValues);
      const inst = server.getSync<MyControllerWithValues>('my-controller');
      expect(inst.values).to.eql([3, 5]);
    });
  });

  it('injects as a view', async () => {
    class MyControllerWithView {
      @inject.view(workloadMonitorFilter)
      view: ContextView<number[]>;
    }

    server.bind('my-controller').toClass(MyControllerWithView);
    const inst = await server.get<MyControllerWithView>('my-controller');
    const view = inst.view;
    expect(await view.values()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    const binding = givenWorkloadMonitor(server, 'server-reporter-2', 7);
    // The view picks up the new binding
    expect(await view.values()).to.eql([3, 7, 5]);
    server.unbind(binding.key);
    expect(await view.values()).to.eql([3, 5]);
  });

  function givenWorkloadMonitors() {
    givenServerWithinAnApp();
    givenWorkloadMonitor(server, 'server-reporter', 3);
    givenWorkloadMonitor(app, 'app-reporter', 5);
  }

  /**
   * Add a workload monitor to the given context
   * @param ctx Context object
   * @param name Name of the monitor
   * @param workload Current workload
   */
  function givenWorkloadMonitor(ctx: Context, name: string, workload: number) {
    return ctx
      .bind(`workloadMonitors.${name}`)
      .to(workload)
      .tag('workloadMonitor');
  }
});

function givenServerWithinAnApp() {
  app = new Context('app');
  server = new Context(app, 'server');
}
