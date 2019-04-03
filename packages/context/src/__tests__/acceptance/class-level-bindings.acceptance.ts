// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  BindingKey,
  BindingScope,
  Constructor,
  Context,
  Getter,
  inject,
  Injection,
  invokeMethod,
  Provider,
  ResolutionSession,
  Setter,
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

  const STORE_KEY = 'store';
  const HASH_KEY = BindingKey.create<string>('hash');

  it('injects a getter function', async () => {
    ctx.bind(HASH_KEY).to('123');

    class Store {
      constructor(@inject.getter(HASH_KEY) public getter: Getter<string>) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    const store = ctx.getSync<Store>(STORE_KEY);

    expect(store.getter).to.be.Function();
    expect(await store.getter()).to.equal('123');

    // rebind the value to verify that getter always returns a fresh value
    ctx.bind(HASH_KEY).to('456');
    expect(await store.getter()).to.equal('456');
  });

  describe('in SINGLETON scope', () => {
    it('throws if a getter cannot be resolved by the owning context', async () => {
      class Store {
        constructor(@inject.getter(HASH_KEY) public getter: Getter<string>) {}
      }

      const requestCtx = givenRequestContextWithSingletonStore(Store);

      // Create the store instance from the child context
      // Now the singleton references a `getter` to `hash` binding from
      // the `requestCtx`
      const store = requestCtx.getSync<Store>(STORE_KEY);

      // The `hash` injection of `Store` cannot be fulfilled by a binding (123)
      // in `requestCtx` because `Store` is bound to `ctx` in `SINGLETON` scope
      await expect(store.getter()).to.be.rejectedWith(
        /The key 'hash' is not bound to any value in context .+/,
      );

      // Now bind `hash` to `456` to to ctx
      ctx.bind(HASH_KEY).to('456');
      // The `hash` injection of `Store` can now be resolved
      expect(await store.getter()).to.equal('456');
    });

    it('throws if a value cannot be resolved by the owning context', async () => {
      class Store {
        constructor(@inject(HASH_KEY) public hash: string) {}
      }

      const requestCtx = givenRequestContextWithSingletonStore(Store);

      // The `hash` injection of `Store` cannot be fulfilled by a binding (123)
      // in `requestCtx` because `Store` is bound to `ctx` in `SINGLETON` scope
      await expect(requestCtx.get(STORE_KEY)).to.be.rejectedWith(
        /The key 'hash' is not bound to any value in context .+/,
      );

      // Now bind `hash` to `456` to to ctx
      ctx.bind(HASH_KEY).to('456');
      // The `hash` injection of `Store` can now be resolved
      const store = await requestCtx.get<Store>(STORE_KEY);
      expect(store.hash).to.equal('456');
    });

    it('injects method parameters from a child context', async () => {
      class Store {
        private name = 'my-store';

        static getHash(@inject(HASH_KEY) hash: string) {
          return hash;
        }

        getHashWithName(@inject(HASH_KEY) hash: string) {
          return `${hash}: ${this.name}`;
        }
      }

      const requestCtx = givenRequestContextWithSingletonStore(Store);

      let value = await invokeMethod(Store, 'getHash', requestCtx);
      expect(value).to.equal('123');

      const store = await requestCtx.get<Store>(STORE_KEY);
      value = await invokeMethod(store, 'getHashWithName', requestCtx);
      expect(value).to.equal('123: my-store');

      // bind the value to to ctx
      ctx.bind(HASH_KEY).to('456');

      value = await invokeMethod(Store, 'getHash', ctx);
      expect(value).to.equal('456');

      value = await invokeMethod(store, 'getHashWithName', ctx);
      expect(value).to.equal('456: my-store');
    });

    it('injects only bindings from the owner context with @inject.tag', async () => {
      class Store {
        constructor(@inject.tag('feature') public features: string[]) {}
      }

      const requestCtx = givenRequestContextWithSingletonStore(Store);

      ctx
        .bind('features.security')
        .to('security')
        .tag('feature');
      requestCtx
        .bind('features.debug')
        .to('debug')
        .tag('feature');

      const store = await requestCtx.get<Store>(STORE_KEY);
      // For singleton bindings, the injected tagged bindings will be only from
      // the owner context (`ctx`) instead of the current one (`requestCtx`)
      // used to resolve the bound `Store`
      expect(store.features).to.eql(['security']);
    });

    it('injects owner context with @inject.context', async () => {
      class Store {
        constructor(@inject.context() public context: Context) {}
      }

      const requestCtx = givenRequestContextWithSingletonStore(Store);

      const store = await requestCtx.get<Store>(STORE_KEY);
      // For singleton bindings, the injected context will be the owner context
      // (`ctx`) instead of the current one (`requestCtx`) used to resolve the
      // bound `Store`
      expect(store.context).to.equal(ctx);
    });

    it('injects setter of owner context with @inject.setter', async () => {
      class Store {
        constructor(@inject.setter(HASH_KEY) public setHash: Setter<string>) {}
      }

      const requestCtx = givenRequestContextWithSingletonStore(Store);

      const store = await requestCtx.get<Store>(STORE_KEY);
      store.setHash('456');

      // For singleton bindings, the injected setter will set value to the owner
      // context (`ctx`) instead of the current one (`requestCtx`) used to
      // resolve the bound `Store`
      expect(await ctx.get<string>(HASH_KEY)).to.equal('456');
      expect(await requestCtx.get<string>(HASH_KEY)).to.equal('123');
    });

    function givenRequestContextWithSingletonStore(
      storeClass: Constructor<unknown>,
    ) {
      // Create a child context of `ctx`
      const requestCtx = new Context(ctx, 'child');
      // Bind `hash` to `123` in the `requestCtx`
      requestCtx.bind(HASH_KEY).to('123');

      // Bind `Store` as a singleton at parent level (`ctx`)
      ctx
        .bind(STORE_KEY)
        .toClass(storeClass)
        .inScope(BindingScope.SINGLETON);
      return requestCtx;
    }
  });

  it('injects a setter function', async () => {
    class Store {
      constructor(@inject.setter(HASH_KEY) public setter: Setter<string>) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    const store = ctx.getSync<Store>(STORE_KEY);

    expect(store.setter).to.be.Function();
    store.setter('a-value');
    expect(ctx.getSync(HASH_KEY)).to.equal('a-value');
  });

  it('creates getter from a value', () => {
    const getter = Getter.fromValue('data');
    expect(getter).to.be.a.Function();
    return expect(getter()).to.be.fulfilledWith('data');
  });

  it('reports an error if @inject.getter has a non-function target', async () => {
    ctx.bind('key').to('value');

    class Store {
      constructor(@inject.getter('key') public getter: string) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    expect(() => ctx.getSync<Store>(STORE_KEY)).to.throw(
      'The type of Store.constructor[0] (String) is not a Getter function',
    );
  });

  it('reports an error if @inject.setter has a non-function target', async () => {
    ctx.bind('key').to('value');

    class Store {
      constructor(@inject.setter('key') public setter: object) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    expect(() => ctx.getSync<Store>(STORE_KEY)).to.throw(
      'The type of Store.constructor[0] (Object) is not a Setter function',
    );
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
    ctx.bind(STORE_KEY).toClass(Store);
    const store: Store = ctx.getSync(STORE_KEY);
    expect(store.context).to.be.exactly(ctx);
  });

  it('injects values by tag', () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .to('San Jose')
      .tag('store:location');
    const store: Store = ctx.getSync(STORE_KEY);
    expect(store.locations).to.eql(['San Francisco', 'San Jose']);
  });

  it('injects values by tag regex', () => {
    class Store {
      constructor(@inject.tag(/.+:location:sj/) public locations: string[]) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location:sf');
    ctx
      .bind('store.locations.sj')
      .to('San Jose')
      .tag('store:location:sj');
    const store: Store = ctx.getSync(STORE_KEY);
    expect(store.locations).to.eql(['San Jose']);
  });

  it('injects empty values by tag if not found', () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    const store: Store = ctx.getSync(STORE_KEY);
    expect(store.locations).to.eql([]);
  });

  it('injects values by tag asynchronously', async () => {
    class Store {
      constructor(@inject.tag('store:location') public locations: string[]) {}
    }

    ctx.bind(STORE_KEY).toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .toDynamicValue(async () => 'San Jose')
      .tag('store:location');
    const store = await ctx.get<Store>(STORE_KEY);
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

    ctx.bind(STORE_KEY).toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .toProvider(LocationProvider)
      .tag('store:location');
    const store = await ctx.get<Store>(STORE_KEY);
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

    ctx.bind(STORE_KEY).toClass(Store);
    ctx
      .bind('store.locations.sf')
      .to('San Francisco')
      .tag('store:location');
    ctx
      .bind('store.locations.sj')
      .toDynamicValue(() => Promise.reject(new Error('Bad')))
      .tag('store:location');
    await expect(ctx.get(STORE_KEY)).to.be.rejectedWith('Bad');
  });

  function createContext() {
    ctx = new Context();
  }
});
