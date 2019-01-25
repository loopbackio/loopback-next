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
    // We have server: 1, app: 2
    expect(await getControllers()).to.eql(['1', '2']);
    server.unbind('controllers.1');
    // Now we have app: 2
    expect(await getControllers()).to.eql(['2']);
    app.unbind('controllers.2');
    // All controllers are gone from the context chain
    expect(await getControllers()).to.eql([]);
    // Add a new controller - server: 3
    givenController(server, '3');
    expect(await getControllers()).to.eql(['3']);
  });

  function givenViewForControllers() {
    givenServerWithinAnApp();
    contextView = server.createView(filterByTag('controller'));
    givenController(server, '1');
    givenController(app, '2');
  }

  function givenController(_ctx: Context, _name: string) {
    class MyController {
      name = _name;
    }
    _ctx
      .bind(`controllers.${_name}`)
      .toClass(MyController)
      .tag('controller');
  }

  async function getControllers() {
    // tslint:disable-next-line:no-any
    return (await contextView.values()).map((v: any) => v.name);
  }
});

describe('@inject.* - injects a live collection of matching bindings', async () => {
  beforeEach(givenPrimeNumbers);

  class MyControllerWithGetter {
    @inject.getter(filterByTag('prime'))
    getter: Getter<number[]>;
  }

  class MyControllerWithValues {
    constructor(
      @inject(filterByTag('prime'))
      public values: number[],
    ) {}
  }

  class MyControllerWithView {
    @inject.view(filterByTag('prime'))
    view: ContextView<number[]>;
  }

  it('injects as getter', async () => {
    server.bind('my-controller').toClass(MyControllerWithGetter);
    const inst = await server.get<MyControllerWithGetter>('my-controller');
    const getter = inst.getter;
    expect(await getter()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    givenPrime(server, 7);
    // The getter picks up the new binding
    expect(await getter()).to.eql([3, 7, 5]);
  });

  it('injects as values', async () => {
    server.bind('my-controller').toClass(MyControllerWithValues);
    const inst = await server.get<MyControllerWithValues>('my-controller');
    expect(inst.values).to.eql([3, 5]);
  });

  it('injects as a view', async () => {
    server.bind('my-controller').toClass(MyControllerWithView);
    const inst = await server.get<MyControllerWithView>('my-controller');
    const view = inst.view;
    expect(await view.values()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    // Add a new binding that matches the filter
    givenPrime(server, 7);
    // The view picks up the new binding
    expect(await view.values()).to.eql([3, 7, 5]);
    server.unbind('prime.7');
    expect(await view.values()).to.eql([3, 5]);
  });

  function givenPrimeNumbers() {
    givenServerWithinAnApp();
    givenPrime(server, 3);
    givenPrime(app, 5);
  }

  function givenPrime(ctx: Context, p: number) {
    ctx
      .bind(`prime.${p}`)
      .to(p)
      .tag('prime');
  }
});

describe('ContextEventListener', () => {
  let contextListener: MyListenerForControllers;
  beforeEach(givenControllerListener);

  it('receives notifications of matching binding events', async () => {
    const controllers = await getControllers();
    // We have server: 1, app: 2
    // NOTE: The controllers are not guaranteed to be ['1', '2'] as the events
    // are emitted by two context objects and they are processed asynchronously
    expect(controllers).to.containEql('1');
    expect(controllers).to.containEql('2');
    server.unbind('controllers.1');
    // Now we have app: 2
    expect(await getControllers()).to.eql(['2']);
    app.unbind('controllers.2');
    // All controllers are gone from the context chain
    expect(await getControllers()).to.eql([]);
    // Add a new controller - server: 3
    givenController(server, '3');
    expect(await getControllers()).to.eql(['3']);
  });

  class MyListenerForControllers implements ContextObserver {
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

  function givenControllerListener() {
    givenServerWithinAnApp();
    contextListener = new MyListenerForControllers();
    server.subscribe(contextListener);
    givenController(server, '1');
    givenController(app, '2');
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
      setImmediate(() => resolve(Array.from(contextListener.controllers)));
    });
  }
});

function givenServerWithinAnApp() {
  app = new Context('app');
  server = new Context(app, 'server');
}
