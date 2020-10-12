// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  Constructor,
  Context,
  createBindingFromClass,
  injectable,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  Application,
  Component,
  CoreBindings,
  CoreTags,
  LifeCycleObserver,
  lifeCycleObserver,
  Server,
} from '../..';

describe('Application life cycle', () => {
  describe('state', () => {
    it('updates application state', async () => {
      const app = new Application();
      expect(app.state).to.equal('created');
      const initialize = app.init();
      expect(app.state).to.equal('initializing');
      await initialize;
      expect(app.state).to.equal('initialized');
      const start = app.start();
      await start;
      expect(app.state).to.equal('started');
      const stop = app.stop();
      expect(app.state).to.equal('stopping');
      await stop;
      expect(app.state).to.equal('stopped');
    });

    it('calls init by start only once', async () => {
      const app = new Application();
      let start = app.start();
      expect(app.state).to.equal('initializing');
      await start;
      expect(app.state).to.equal('started');
      const stop = app.stop();
      expect(app.state).to.equal('stopping');
      await stop;
      expect(app.state).to.equal('stopped');
      start = app.start();
      expect(app.state).to.equal('starting');
      await start;
      expect(app.state).to.equal('started');
      await app.stop();
    });

    it('emits state change events', async () => {
      const app = new Application();
      const events: string[] = [];
      app.on('stateChanged', event => {
        events.push(`${event.from} -> ${event.to}`);
      });
      const start = app.start();
      expect(events).to.eql(['created -> initializing']);
      await start;
      expect(events).to.eql([
        'created -> initializing',
        'initializing -> initialized',
        'initialized -> starting',
        'starting -> started',
      ]);
      const stop = app.stop();
      expect(events).to.eql([
        'created -> initializing',
        'initializing -> initialized',
        'initialized -> starting',
        'starting -> started',
        'started -> stopping',
      ]);
      await stop;
      expect(events).to.eql([
        'created -> initializing',
        'initializing -> initialized',
        'initialized -> starting',
        'starting -> started',
        'started -> stopping',
        'stopping -> stopped',
      ]);
    });

    it('emits state events', async () => {
      const app = new Application();
      const events: string[] = [];
      for (const e of [
        'initializing',
        'initialized',
        'starting',
        'started',
        'stopping',
        'stopped',
      ]) {
        app.on(e, event => {
          events.push(e);
        });
      }
      const start = app.start();
      expect(events).to.eql(['initializing']);
      await start;
      expect(events).to.eql([
        'initializing',
        'initialized',
        'starting',
        'started',
      ]);
      const stop = app.stop();
      expect(events).to.eql([
        'initializing',
        'initialized',
        'starting',
        'started',
        'stopping',
      ]);
      await stop;
      expect(events).to.eql([
        'initializing',
        'initialized',
        'starting',
        'started',
        'stopping',
        'stopped',
      ]);
    });

    it('allows application.stop when it is created', async () => {
      const app = new Application();
      await app.stop(); // no-op
      expect(app.state).to.equal('created');
    });

    it('await application.stop when it is stopping', async () => {
      const app = new Application();
      await app.start();
      const stop = app.stop();
      const stopAgain = app.stop();
      await stop;
      await stopAgain;
      expect(app.state).to.equal('stopped');
    });

    it('await application.start when it is starting', async () => {
      const app = new Application();
      const start = app.start();
      const startAgain = app.start();
      await start;
      await startAgain;
      expect(app.state).to.equal('started');
    });
  });

  describe('start', () => {
    it('starts all injected servers', async () => {
      const app = new Application();
      app.component(ObservingComponentWithServers);
      const component = await app.get<ObservingComponentWithServers>(
        `${CoreBindings.COMPONENTS}.ObservingComponentWithServers`,
      );
      expect(component.status).to.equal('not-initialized');
      await app.start();
      const server = await app.getServer(ObservingServer);

      expect(server).to.not.be.null();
      expect(server.listening).to.equal(true);
      expect(component.status).to.equal('started');
      await app.stop();
    });

    it('starts servers bound with `LIFE_CYCLE_OBSERVER` tag', async () => {
      const app = new Application();
      app
        .bind('fake-server')
        .toClass(ObservingServer)
        .tag(CoreTags.LIFE_CYCLE_OBSERVER, CoreTags.SERVER)
        .inScope(BindingScope.SINGLETON);
      await app.start();
      const server = await app.get<ObservingServer>('fake-server');

      expect(server).to.not.be.null();
      expect(server.listening).to.equal(true);
      await app.stop();
    });

    it('starts/stops all registered components', async () => {
      const app = new Application();
      app.component(ObservingComponentWithServers);
      const component = await app.get<ObservingComponentWithServers>(
        `${CoreBindings.COMPONENTS}.ObservingComponentWithServers`,
      );
      expect(component.status).to.equal('not-initialized');
      await app.start();
      expect(component.status).to.equal('started');
      await app.stop();
      expect(component.status).to.equal('stopped');
    });

    it('initializes all registered components', async () => {
      const app = new Application();
      app.component(ObservingComponentWithServers);
      const component = await app.get<ObservingComponentWithServers>(
        `${CoreBindings.COMPONENTS}.ObservingComponentWithServers`,
      );
      expect(component.status).to.equal('not-initialized');
      await app.init();
      expect(component.status).to.equal('initialized');
      expect(component.initialized).to.be.true();
    });

    it('initializes all registered components by start', async () => {
      const app = new Application();
      app.component(ObservingComponentWithServers);
      const component = await app.get<ObservingComponentWithServers>(
        `${CoreBindings.COMPONENTS}.ObservingComponentWithServers`,
      );
      expect(component.status).to.equal('not-initialized');
      await app.start();
      expect(component.status).to.equal('started');
      expect(component.initialized).to.be.true();
    });

    it('starts/stops all observers from the component', async () => {
      const app = new Application();
      app.component(ComponentWithObservers);
      const observer = await app.get<MyObserver>(
        'lifeCycleObservers.MyObserver',
      );
      const observerWithDecorator = await app.get<MyObserverWithDecorator>(
        'lifeCycleObservers.MyObserverWithDecorator',
      );
      expect(observer.status).to.equal('not-initialized');
      expect(observerWithDecorator.status).to.equal('not-initialized');
      await app.start();
      expect(observer.status).to.equal('started');
      expect(observerWithDecorator.status).to.equal('started');
      await app.stop();
      expect(observer.status).to.equal('stopped');
      expect(observerWithDecorator.status).to.equal('stopped');
    });

    it('starts/stops all registered life cycle observers', async () => {
      const app = new Application();
      app.lifeCycleObserver(MyObserver, 'my-observer');

      const observer = await app.get<MyObserver>(
        'lifeCycleObservers.my-observer',
      );
      expect(observer.status).to.equal('not-initialized');
      await app.start();
      expect(observer.status).to.equal('started');
      await app.stop();
      expect(observer.status).to.equal('stopped');
    });

    it('registers life cycle observers with options', async () => {
      const app = new Application();
      const binding = app.lifeCycleObserver(MyObserver, {
        name: 'my-observer',
        namespace: 'my-observers',
      });
      expect(binding.key).to.eql('my-observers.my-observer');
    });

    it('honors @injectable', async () => {
      @injectable({
        tags: {
          [CoreTags.LIFE_CYCLE_OBSERVER]: CoreTags.LIFE_CYCLE_OBSERVER,
          [CoreTags.LIFE_CYCLE_OBSERVER_GROUP]: 'my-group',
          namespace: CoreBindings.LIFE_CYCLE_OBSERVERS,
        },
        scope: BindingScope.SINGLETON,
      })
      class MyObserverWithBind implements LifeCycleObserver {
        status = 'not-initialized';

        start() {
          this.status = 'started';
        }
        stop() {
          this.status = 'stopped';
        }
      }

      const app = new Application();
      const binding = createBindingFromClass(MyObserverWithBind);
      app.add(binding);
      expect(binding.tagMap[CoreTags.LIFE_CYCLE_OBSERVER_GROUP]).to.eql(
        'my-group',
      );

      const observer = await app.get<MyObserverWithBind>(binding.key);
      expect(observer.status).to.equal('not-initialized');
      await app.start();
      expect(observer.status).to.equal('started');
      await app.stop();
      expect(observer.status).to.equal('stopped');
    });

    it('honors @lifeCycleObserver', async () => {
      const app = new Application();
      const binding = createBindingFromClass(MyObserverWithDecorator);
      app.add(binding);
      expect(binding.tagMap[CoreTags.LIFE_CYCLE_OBSERVER_GROUP]).to.eql(
        'my-group',
      );
      expect(binding.scope).to.eql(BindingScope.SINGLETON);

      const observer = await app.get<MyObserverWithDecorator>(binding.key);
      expect(observer.status).to.equal('not-initialized');
      await app.start();
      expect(observer.status).to.equal('started');
      await app.stop();
      expect(observer.status).to.equal('stopped');
    });

    it('does not attempt to start poorly named bindings', async () => {
      const app = new Application();
      let startInvoked = false;
      let stopInvoked = false;

      // The app.start should not attempt to start this binding.
      app.bind('controllers.servers').to({
        start: () => {
          startInvoked = true;
        },
        stop: () => {
          stopInvoked = true;
        },
      });
      await app.start();
      expect(startInvoked).to.be.false(); // not invoked
      await app.stop();
      expect(stopInvoked).to.be.false(); // not invoked
    });
  });

  describe('app.onInit()', () => {
    it('registers the handler as "init" lifecycle observer', async () => {
      const app = new Application();
      let invoked = false;

      const binding = app.onInit(async function doSomething() {
        // delay the actual observer code to the next tick to
        // verify that the promise returned by an async observer
        // is correctly forwarded by LifeCycle wrapper
        await Promise.resolve();
        invoked = true;
      });

      expect(binding.key).to.match(/^lifeCycleObservers.doSomething/);

      await app.start();
      expect(invoked).to.be.true();
    });

    it('registers multiple handlers with the same name', async () => {
      const app = new Application();
      const invoked: string[] = [];

      app.onInit(() => {
        invoked.push('first');
      });
      app.onInit(() => {
        invoked.push('second');
      });

      await app.init();
      expect(invoked).to.deepEqual(['first', 'second']);
    });
  });

  describe('app.onStart()', () => {
    it('registers the handler as "start" lifecycle observer', async () => {
      const app = new Application();
      let invoked = false;

      const binding = app.onStart(async function doSomething() {
        // delay the actual observer code to the next tick to
        // verify that the promise returned by an async observer
        // is correctly forwarded by LifeCycle wrapper
        await Promise.resolve();
        invoked = true;
      });

      expect(binding.key).to.match(/^lifeCycleObservers.doSomething/);

      await app.start();
      expect(invoked).to.be.true();
    });

    it('registers multiple handlers with the same name', async () => {
      const app = new Application();
      const invoked: string[] = [];

      app.onStart(() => {
        invoked.push('first');
      });
      app.onStart(() => {
        invoked.push('second');
      });

      await app.start();
      expect(invoked).to.deepEqual(['first', 'second']);
    });
  });

  describe('app.onStop()', () => {
    it('registers the handler as "stop" lifecycle observer', async () => {
      const app = new Application();
      let invoked = false;

      const binding = app.onStop(async function doSomething() {
        // delay the actual observer code to the next tick to
        // verify that the promise returned by an async observer
        // is correctly forwarded by LifeCycle wrapper
        await Promise.resolve();
        invoked = true;
      });

      expect(binding.key).to.match(/^lifeCycleObservers.doSomething/);

      await app.start();
      expect(invoked).to.be.false();
      await app.stop();
      expect(invoked).to.be.true();
    });

    it('registers multiple handlers with the same name', async () => {
      const app = new Application();
      const invoked: string[] = [];
      app.onStop(() => {
        invoked.push('first');
      });
      app.onStop(() => {
        invoked.push('second');
      });
      await app.start();
      expect(invoked).to.be.empty();
      await app.stop();
      // `stop` observers are invoked in reverse order
      expect(invoked).to.deepEqual(['second', 'first']);
    });
  });
});

class ObservingComponentWithServers implements Component, LifeCycleObserver {
  status = 'not-initialized';
  initialized = false;

  servers: {
    [name: string]: Constructor<Server>;
  };
  constructor() {
    this.servers = {
      ObservingServer: ObservingServer,
      ObservingServer2: ObservingServer,
    };
  }

  init() {
    this.status = 'initialized';
    this.initialized = true;
  }
  start() {
    this.status = 'started';
  }
  stop() {
    this.status = 'stopped';
  }
}

class ObservingServer extends Context implements Server {
  listening = false;
  constructor() {
    super();
  }
  async start(): Promise<void> {
    this.listening = true;
  }

  async stop(): Promise<void> {
    this.listening = false;
  }
}

class MyObserver implements LifeCycleObserver {
  status = 'not-initialized';

  start() {
    this.status = 'started';
  }
  stop() {
    this.status = 'stopped';
  }
}

@lifeCycleObserver('my-group', {scope: BindingScope.SINGLETON})
class MyObserverWithDecorator implements LifeCycleObserver {
  status = 'not-initialized';

  start() {
    this.status = 'started';
  }
  stop() {
    this.status = 'stopped';
  }
}

class ComponentWithObservers implements Component {
  lifeCycleObservers = [MyObserver, MyObserverWithDecorator];
}
