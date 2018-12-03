import {expect} from '@loopback/testlab';
import {Context, ContextWatcher, Getter, inject} from '../..';

describe('ContextWatcher - watches matching bindings', () => {
  let ctx: Context;
  let contextWatcher: ContextWatcher;
  beforeEach(givenContextWatcher);

  it('watches matching bindings', async () => {
    // We have ctx: 1, parent: 2
    expect(await getControllers()).to.eql(['1', '2']);
    ctx.unbind('controllers.1');
    // Now we have parent: 2
    expect(await getControllers()).to.eql(['2']);
    ctx.parent!.unbind('controllers.2');
    // All controllers are gone from the context chain
    expect(await getControllers()).to.eql([]);
    // Add a new controller - ctx: 3
    givenController(ctx, '3');
    expect(await getControllers()).to.eql(['3']);
  });

  function givenContextWatcher() {
    ctx = givenContext();
    contextWatcher = ctx.watch(Context.bindingTagFilter('controller'));
    givenController(ctx, '1');
    givenController(ctx.parent!, '2');
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
    return (await contextWatcher.values()).map((v: any) => v.name);
  }
});

describe('@inject.filter - injects a live collection of matching bindings', async () => {
  let ctx: Context;
  beforeEach(givenPrimeNumbers);

  class MyControllerWithGetter {
    @inject.filter(Context.bindingTagFilter('prime'), {watch: true})
    getter: Getter<string[]>;
  }

  class MyControllerWithValues {
    constructor(
      @inject.filter(Context.bindingTagFilter('prime'))
      public values: string[],
    ) {}
  }

  class MyControllerWithTracker {
    @inject.filter(Context.bindingTagFilter('prime'))
    watcher: ContextWatcher<string[]>;
  }

  it('injects as getter', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithGetter);
    const inst = await ctx.get<MyControllerWithGetter>('my-controller');
    const getter = inst.getter;
    expect(await getter()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    givenPrime(ctx, 7);
    // The getter picks up the new binding
    expect(await getter()).to.eql([3, 7, 5]);
  });

  it('injects as values', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithValues);
    const inst = await ctx.get<MyControllerWithValues>('my-controller');
    expect(inst.values).to.eql([3, 5]);
  });

  it('injects as a watcher', async () => {
    ctx.bind('my-controller').toClass(MyControllerWithTracker);
    const inst = await ctx.get<MyControllerWithTracker>('my-controller');
    const watcher = inst.watcher;
    expect(await watcher.values()).to.eql([3, 5]);
    // Add a new binding that matches the filter
    // Add a new binding that matches the filter
    givenPrime(ctx, 7);
    // The watcher picks up the new binding
    expect(await watcher.values()).to.eql([3, 7, 5]);
    ctx.unbind('prime.7');
    expect(await watcher.values()).to.eql([3, 5]);
  });

  function givenPrimeNumbers() {
    ctx = givenContext();
    givenPrime(ctx, 3);
    givenPrime(ctx.parent!, 5);
  }

  function givenPrime(_ctx: Context, p: number) {
    _ctx
      .bind(`prime.${p}`)
      .to(p)
      .tag('prime');
  }
});

function givenContext() {
  const parent = new Context('app');
  const ctx = new Context(parent, 'server');
  return ctx;
}
