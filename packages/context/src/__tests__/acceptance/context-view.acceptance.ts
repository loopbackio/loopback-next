import {expect} from '@loopback/testlab';
import {
  Binding,
  filterByTag,
  Context,
  ContextObserver,
  ContextEventType,
  ContextView,
  Getter,
  inject,
} from '../..';

let app: Context;
let server: Context;

describe('ContextView', () => {
  let contextView: ContextView;
  beforeEach(givenViewForControllers);

  it('watches matching bindings', async () => {
    // We have server: ServerController, app: AppController
    expect(await getControllers()).to.eql([
      'ServerController',
      'AppController',
    ]);
    server.unbind('controllers.ServerController');
    // Now we have app: AppController
    expect(await getControllers()).to.eql(['AppController']);
    app.unbind('controllers.AppController');
    // All controllers are gone from the context chain
    expect(await getControllers()).to.eql([]);
    // Add a new controller - server: AnotherServerController
    givenController(server, 'AnotherServerController');
    expect(await getControllers()).to.eql(['AnotherServerController']);
  });

  function givenViewForControllers() {
    givenServerWithinAnApp();
    contextView = server.createView(filterByTag('controller'));
    givenController(server, 'ServerController');
    givenController(app, 'AppController');
  }

  function givenController(context: Context, name: string) {
    class MyController {
      name = name;
    }
    context
      .bind(`controllers.${name}`)
      .toClass(MyController)
      .tag('controller');
  }

  async function getControllers() {
    // tslint:disable-next-line:no-any
    return (await contextView.values()).map((v: any) => v.name);
  }
});

describe('@inject.* with binding filter', async () => {
  const workloadMonitorFilter = filterByTag('workloadMonitor');
  beforeEach(givenWorkloadMonitors);

  class MyControllerWithGetter {
    @inject.getter(workloadMonitorFilter)
    getter: Getter<number[]>;
  }

  class MyControllerWithValues {
    constructor(
      @inject(workloadMonitorFilter)
      public values: number[],
    ) {}
  }

  class MyControllerWithView {
    @inject.view(workloadMonitorFilter)
    view: ContextView<number[]>;
  }

  it('injects as getter', async () => {
    server.bind('my-controller').toClass(MyControllerWithGetter);
    const inst = await server.get<MyControllerWithGetter>('my-controller');
    const getter = inst.getter;
    expect(await getter()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    givenWorkloadMonitor(server, 'server-reporter-2', 7);
    // The getter picks up the new binding
    expect(await getter()).to.eql([3, 7, 5]);
  });

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

  it('injects as a view', async () => {
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

describe('ContextEventObserver', () => {
  let contextObserver: MyObserverForControllers;
  beforeEach(givenControllerObserver);

  it('receives notifications of matching binding events', async () => {
    const controllers = await getControllers();
    // We have server: ServerController, app: AppController
    // NOTE: The controllers are not guaranteed to be ['ServerController`,
    // 'AppController'] as the events are emitted by two context objects and
    // they are processed asynchronously
    expect(controllers).to.containEql('ServerController');
    expect(controllers).to.containEql('AppController');
    server.unbind('controllers.ServerController');
    // Now we have app: AppController
    expect(await getControllers()).to.eql(['AppController']);
    app.unbind('controllers.AppController');
    // All controllers are gone from the context chain
    expect(await getControllers()).to.eql([]);
    // Add a new controller - server: AnotherServerController
    givenController(server, 'AnotherServerController');
    expect(await getControllers()).to.eql(['AnotherServerController']);
  });

  class MyObserverForControllers implements ContextObserver {
    controllers: Set<string> = new Set();
    filter = filterByTag('controller');
    observe(event: ContextEventType, binding: Readonly<Binding<unknown>>) {
      if (event === 'bind') {
        this.controllers.add(binding.tagMap.name);
      } else if (event === 'unbind') {
        this.controllers.delete(binding.tagMap.name);
      }
    }
  }

  function givenControllerObserver() {
    givenServerWithinAnApp();
    contextObserver = new MyObserverForControllers();
    server.subscribe(contextObserver);
    givenController(server, 'ServerController');
    givenController(app, 'AppController');
  }

  function givenController(ctx: Context, controllerName: string) {
    class MyController {
      name = controllerName;
    }
    ctx
      .bind(`controllers.${controllerName}`)
      .toClass(MyController)
      .tag('controller', {name: controllerName});
  }

  async function getControllers() {
    return new Promise<string[]>(resolve => {
      // Wrap it inside `setImmediate` to make the events are triggered
      setImmediate(() => resolve(Array.from(contextObserver.controllers)));
    });
  }
});

function givenServerWithinAnApp() {
  app = new Context('app');
  server = new Context(app, 'server');
}
