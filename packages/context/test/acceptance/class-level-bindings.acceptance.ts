// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Context,
  inject,
  Setter,
  Getter,
  Provider,
  Injection,
  ResolutionSession,
  instantiateClass,
} from '../..';

const INFO_CONTROLLER = 'controllers.info';

describe('Context bindings - Injecting dependencies of classes', () => {
  let ctx: Context;
  beforeEach('given a context', createContext);

  it('injects constructor args', async () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(@inject('application.name') public appName: string) {}
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const instance = await ctx.get(INFO_CONTROLLER);
    expect(instance).to.have.property('appName', 'CodeHub');
  });

  it('throws helpful error when no ctor args are decorated', () => {
    class InfoController {
      constructor(appName: string) {}
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    return ctx.get(INFO_CONTROLLER).then(
      function onSuccess() {
        throw new Error('ctx.get() should have failed');
      },
      function onError(err) {
        expect(err).to.match(/resolve.*InfoController.*argument 1/);
      },
    );
  });

  it('throws helpful error when some ctor args are not decorated', () => {
    ctx.bind('application.name').to('CodeHub');

    class InfoController {
      constructor(
        argNotInjected: string,
        @inject('application.name') appName: string,
      ) {}
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    return ctx.get(INFO_CONTROLLER).then(
      function onSuccess() {
        throw new Error('ctx.get() should have failed');
      },
      function onError(err) {
        expect(err).to.match(/resolve.*InfoController.*argument 1/);
      },
    );
  });

  it('resolves promises before injecting parameters', async () => {
    ctx.bind('authenticated').toDynamicValue(async () => {
      // Emulate asynchronous database call
      await Promise.resolve();
      // Return the authentication result
      return false;
    });

    class InfoController {
      constructor(@inject('authenticated') public isAuthenticated: boolean) {}
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const instance = await ctx.get(INFO_CONTROLLER);
    expect(instance).to.have.property('isAuthenticated', false);
  });

  // tslint:disable-next-line:max-line-length
  it('creates instance synchronously when all dependencies are sync too', () => {
    ctx.bind('appName').to('CodeHub');
    class InfoController {
      constructor(@inject('appName') public appName: string) {}
    }
    const b = ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const valueOrPromise = b.getValue(ctx);
    expect(valueOrPromise).to.not.be.Promise();
    expect(valueOrPromise as InfoController).to.have.property(
      'appName',
      'CodeHub',
    );
  });

  it('resolves promises before injecting properties', async () => {
    ctx.bind('authenticated').toDynamicValue(async () => {
      // Emulate asynchronous database call
      await Promise.resolve();
      // Return the authentication result
      return false;
    });

    class InfoController {
      @inject('authenticated')
      public isAuthenticated: boolean;
    }
    ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const instance = await ctx.get(INFO_CONTROLLER);
    expect(instance).to.have.property('isAuthenticated', false);
  });

  // tslint:disable-next-line:max-line-length
  it('creates instance synchronously when property/constructor dependencies are sync too', () => {
    ctx.bind('appName').to('CodeHub');
    ctx.bind('authenticated').to(false);
    class InfoController {
      constructor(@inject('appName') public appName: string) {}

      @inject('authenticated')
      public isAuthenticated: boolean;
    }
    const b = ctx.bind(INFO_CONTROLLER).toClass(InfoController);

    const valueOrPromise = b.getValue(ctx);
    expect(valueOrPromise).to.not.be.Promise();
    expect(valueOrPromise as InfoController).to.have.property(
      'appName',
      'CodeHub',
    );
    expect(valueOrPromise as InfoController).to.have.property(
      'isAuthenticated',
      false,
    );
  });

  it('injects a getter function', async () => {
    ctx.bind('key').to('value');

    class Store {
      constructor(@inject.getter('key') public getter: Getter<string>) {}
    }

    ctx.bind('store').toClass(Store);
    const store = ctx.getSync<Store>('store');

    expect(store.getter).to.be.Function();
    expect(await store.getter()).to.equal('value');

    // rebind the value to verify that getter always returns a fresh value
    ctx.bind('key').to('new-value');
    expect(await store.getter()).to.equal('new-value');
  });

  it('injects a setter function', async () => {
    class Store {
      constructor(@inject.setter('key') public setter: Setter<string>) {}
    }

    ctx.bind('store').toClass(Store);
    const store = ctx.getSync<Store>('store');

    expect(store.setter).to.be.Function();
    store.setter('a-value');
    expect(ctx.getSync('key')).to.equal('a-value');
  });

  it('creates getter from a value', () => {
    const getter = Getter.fromValue('data');
    expect(getter).to.be.a.Function();
    return expect(getter()).to.be.fulfilledWith('data');
  });

  it('injects a nested property', async () => {
    class TestComponent {
      constructor(@inject('config#test') public config: string) {}
    }

    ctx.bind('config').to({test: 'test-config'});
    ctx.bind('component').toClass(TestComponent);

    const resolved = await ctx.get<TestComponent>('component');
    expect(resolved.config).to.equal('test-config');
  });

  it('injects context with @inject.context', () => {
    class Store {
      constructor(@inject.context() public context: Context) {}
    }
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.context).to.be.exactly(ctx);
  });

  it('injects values by tag', () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind('store').toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .to('San Jose')
      .tag('store:location');
    const store: Store = ctx.getSync('store');
    expect(store.locations).to.eql(['San Francisco', 'San Jose']);
  });

  it('injects values by tag regex', () => {
    class Store {
      constructor(@inject.tag(/.+:location:sj/) public locations: string[]) {}
    }

    ctx.bind('store').toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location:sf');
    ctx
      .bind('store.locations.sj')
      .to('San Jose')
      .tag('store:location:sj');
    const store: Store = ctx.getSync('store');
    expect(store.locations).to.eql(['San Jose']);
  });

  it('injects empty values by tag if not found', () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.locations).to.eql([]);
  });

  it('injects values by tag asynchronously', async () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind('store').toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .toDynamicValue(async () => 'San Jose')
      .tag('store:location');
    const store = await ctx.get<Store>('store');
    expect(store.locations).to.eql(['San Francisco', 'San Jose']);
  });

  it('injects values by tag asynchronously', async () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    let resolutionPath;
    class LocationProvider implements Provider<string> {
      @inject(
        'location',
        {},
        // Set up a custom resolve() to access information from the session
        (c: Context, injection: Injection, session: ResolutionSession) => {
          resolutionPath = session.getResolutionPath();
          return 'San Jose';
        },
      )
      location: string;
      value() {
        return this.location;
      }
    }

    ctx.bind('store').toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .toProvider(LocationProvider)
      .tag('store:location');
    const store = await ctx.get<Store>('store');
    expect(store.locations).to.eql(['San Francisco', 'San Jose']);
    expect(resolutionPath).to.eql(
      'store --> @Store.constructor[0] --> store.locations.sj --> ' +
        '@LocationProvider.prototype.location',
    );
  });

  it('reports error when @inject.tag rejects a promise', async () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind('store').toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .toDynamicValue(() => Promise.reject(new Error('Bad')))
      .tag('store:location');
    await expect(ctx.get('store')).to.be.rejectedWith('Bad');
  });

  it('injects a config property', () => {
    class Store {
      constructor(
        @inject.config('x') public optionX: number,
        @inject.config('y') public optionY: string,
      ) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.optionX).to.eql(1);
    expect(store.optionY).to.eql('a');
  });

  it('injects a config property with promise value', async () => {
    class Store {
      constructor(@inject.config('x') public optionX: number) {}
    }

    ctx.configure('store').toDynamicValue(async () => {
      return {x: 1};
    });
    ctx.bind('store').toClass(Store);
    const store = await ctx.get<Store>('store');
    expect(store.optionX).to.eql(1);
  });

  it('injects a config property with a binding provider', async () => {
    class MyConfigProvider implements Provider<{}> {
      constructor(@inject('prefix') private prefix: string) {}
      value() {
        return {
          myOption: this.prefix + 'my-option',
        };
      }
    }

    class Store {
      constructor(@inject.config('myOption') public myOption: string) {}
    }

    ctx.bind('config').toProvider(MyConfigProvider);
    ctx.configure('store').toProvider(MyConfigProvider);
    ctx.bind('prefix').to('hello-');
    ctx.bind('store').toClass(Store);

    const store = await ctx.get<Store>('store');
    expect(store.myOption).to.eql('hello-my-option');
  });

  it('injects a config property with a rejected promise', async () => {
    class Store {
      constructor(@inject.config('x') public optionX: number) {}
    }

    ctx
      .configure('store')
      .toDynamicValue(() => Promise.reject(Error('invalid')));

    ctx.bind('store').toClass(Store);

    await expect(ctx.get('store')).to.be.rejectedWith('invalid');
  });

  it('injects a config property with nested property', () => {
    class Store {
      constructor(@inject.config('x.y') public optionXY: string) {}
    }

    ctx.configure('store').to({x: {y: 'y'}});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.optionXY).to.eql('y');
  });

  it('injects config if the binding key is not present', () => {
    class Store {
      constructor(@inject.config() public config: object) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.config).to.eql({x: 1, y: 'a'});
  });

  it("injects config if the binding key is ''", () => {
    class Store {
      constructor(@inject.config('') public config: object) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.config).to.eql({x: 1, y: 'a'});
  });

  it('injects config if the binding key is a path', () => {
    class Store {
      constructor(@inject.config('x') public optionX: number) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.optionX).to.eql(1);
  });

  it('injects undefined option if key not found', () => {
    class Store {
      constructor(
        // tslint:disable-next-line:no-any
        @inject.config('not-exist') public option: string | undefined,
      ) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.option).to.be.undefined();
  });

  it('injects a config property based on the parent binding', async () => {
    class Store {
      constructor(
        @inject.config('x') public optionX: number,
        @inject.config('y') public optionY: string,
      ) {}
    }

    ctx.configure('store1').to({x: 1, y: 'a'});
    ctx.configure('store2').to({x: 2, y: 'b'});

    ctx.bind('store1').toClass(Store);
    ctx.bind('store2').toClass(Store);

    const store1 = await ctx.get<Store>('store1');
    expect(store1.optionX).to.eql(1);
    expect(store1.optionY).to.eql('a');

    const store2 = await ctx.get<Store>('store2');
    expect(store2.optionX).to.eql(2);
    expect(store2.optionY).to.eql('b');
  });

  it('injects undefined config if no binding is present', async () => {
    class Store {
      constructor(
        // tslint:disable-next-line:no-any
        @inject.config('x') public config: string | undefined,
      ) {}
    }

    const store = await instantiateClass(Store, ctx);
    expect(store.config).to.be.undefined();
  });

  it('injects config from config binding', () => {
    class MyStore {
      constructor(@inject.config('x') public optionX: number) {}
    }

    ctx.configure('stores.MyStore').to({x: 1, y: 'a'});
    ctx.bind('stores.MyStore').toClass(MyStore);

    const store: MyStore = ctx.getSync('stores.MyStore');
    expect(store.optionX).to.eql(1);
  });

  it('injects config from config binding by key namespaces', () => {
    class MyStore {
      constructor(
        @inject.config('x') public optionX: number,
        @inject.config('y') public optionY: string,
      ) {}
    }

    ctx.configure('stores').to({MyStore: {y: 'a'}});
    ctx.configure('stores.MyStore').to({x: 1});
    ctx.bind('stores.MyStore').toClass(MyStore);

    const store: MyStore = ctx.getSync('stores.MyStore');
    expect(store.optionX).to.eql(1);
    expect(store.optionY).to.eql('a');
  });

  function createContext() {
    ctx = new Context();
  }
});
