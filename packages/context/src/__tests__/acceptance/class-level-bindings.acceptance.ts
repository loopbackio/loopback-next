// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  Binding,
  BindingCreationPolicy,
  BindingKey,
  BindingScope,
  config,
  Constructor,
  Context,
  Getter,
  inject,
  Injection,
  instantiateClass,
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
      'The type of Store.constructor[0] (String) is not Getter function',
    );
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

  describe('@inject.setter', () => {
    class Store {
      constructor(@inject.setter(HASH_KEY) public setter: Setter<string>) {}
    }

    it('injects a setter function', () => {
      ctx.bind(STORE_KEY).toClass(Store);
      const store = ctx.getSync<Store>(STORE_KEY);

      expect(store.setter).to.be.Function();
      store.setter('a-value');
      expect(ctx.getSync(HASH_KEY)).to.equal('a-value');
    });

    it('injects a setter function that uses an existing binding', () => {
      // Create a binding for hash key
      ctx
        .bind(HASH_KEY)
        .to('123')
        .tag('hash');
      ctx.bind(STORE_KEY).toClass(Store);
      const store = ctx.getSync<Store>(STORE_KEY);
      // Change the hash value
      store.setter('a-value');
      expect(ctx.getSync(HASH_KEY)).to.equal('a-value');
      // The tag is kept
      expect(ctx.getBinding(HASH_KEY).tagNames).to.containEql('hash');
    });

    it('reports an error if @inject.setter has a non-function target', () => {
      class StoreWithWrongSetterType {
        constructor(@inject.setter(HASH_KEY) public setter: object) {}
      }

      ctx.bind('key').to('value');

      ctx.bind(STORE_KEY).toClass(StoreWithWrongSetterType);
      expect(() => ctx.getSync<Store>(STORE_KEY)).to.throw(
        'The type of StoreWithWrongSetterType.constructor[0] (Object) is not Setter function',
      );
    });

    describe('bindingCreation option', () => {
      it('supports ALWAYS_CREATE', () => {
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.ALWAYS_CREATE));
        const store = ctx.getSync<Store>(STORE_KEY);
        store.setter('a-value');
        const binding1 = ctx.getBinding(HASH_KEY);
        store.setter('b-value');
        const binding2 = ctx.getBinding(HASH_KEY);
        expect(binding1).to.not.exactly(binding2);
      });

      it('supports NEVER_CREATE - throws if not bound', () => {
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.NEVER_CREATE));
        const store = ctx.getSync<Store>(STORE_KEY);
        expect(() => store.setter('a-value')).to.throw(
          /The key 'hash' is not bound to any value in context/,
        );
      });

      it('supports NEVER_CREATE with an existing binding', () => {
        // Create a binding for hash key
        const hashBinding = ctx
          .bind(HASH_KEY)
          .to('123')
          .tag('hash');
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.NEVER_CREATE));
        const store = ctx.getSync<Store>(STORE_KEY);
        store.setter('a-value');
        expect(ctx.getBinding(HASH_KEY)).to.exactly(hashBinding);
        expect(ctx.getSync(HASH_KEY)).to.equal('a-value');
      });

      it('supports CREATE_IF_NOT_BOUND without an existing binding', async () => {
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.CREATE_IF_NOT_BOUND));
        const store = ctx.getSync<Store>(STORE_KEY);
        store.setter('a-value');
        expect(ctx.getSync(HASH_KEY)).to.equal('a-value');
      });

      it('supports CREATE_IF_NOT_BOUND with an existing binding', () => {
        // Create a binding for hash key
        const hashBinding = ctx
          .bind(HASH_KEY)
          .to('123')
          .tag('hash');
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.CREATE_IF_NOT_BOUND));
        const store = ctx.getSync<Store>(STORE_KEY);
        store.setter('a-value');
        expect(ctx.getBinding(HASH_KEY)).to.exactly(hashBinding);
        expect(ctx.getSync(HASH_KEY)).to.equal('a-value');
      });

      function givenStoreClass(bindingCreation?: BindingCreationPolicy) {
        class StoreWithInjectSetterMetadata {
          constructor(
            @inject.setter(HASH_KEY, {bindingCreation})
            public setter: Setter<string>,
          ) {}
        }
        return StoreWithInjectSetterMetadata;
      }
    });
  });

  it('injects a nested property', async () => {
    class TestComponent {
      constructor(@inject('config#test') public configForTest: string) {}
    }

    ctx.bind('config').to({test: 'test-config'});
    ctx.bind('component').toClass(TestComponent);

    const resolved = await ctx.get<TestComponent>('component');
    expect(resolved.configForTest).to.equal('test-config');
  });

  describe('@inject.binding', () => {
    class Store {
      constructor(@inject.binding(HASH_KEY) public binding: Binding<string>) {}
    }

    it('injects a binding', () => {
      ctx.bind(STORE_KEY).toClass(Store);
      const store = ctx.getSync<Store>(STORE_KEY);
      expect(store.binding).to.be.instanceOf(Binding);
    });

    it('injects a binding that exists', () => {
      // Create a binding for hash key
      const hashBinding = ctx
        .bind(HASH_KEY)
        .to('123')
        .tag('hash');
      ctx.bind(STORE_KEY).toClass(Store);
      const store = ctx.getSync<Store>(STORE_KEY);
      expect(store.binding).to.be.exactly(hashBinding);
    });

    it('reports an error if @inject.binding has a wrong target type', () => {
      class StoreWithWrongBindingType {
        constructor(@inject.binding(HASH_KEY) public binding: object) {}
      }

      ctx.bind(STORE_KEY).toClass(StoreWithWrongBindingType);
      expect(() => ctx.getSync<Store>(STORE_KEY)).to.throw(
        'The type of StoreWithWrongBindingType.constructor[0] (Object) is not Binding',
      );
    });

    describe('bindingCreation option', () => {
      it('supports ALWAYS_CREATE', () => {
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.ALWAYS_CREATE));
        const binding1 = ctx.getSync<Store>(STORE_KEY).binding;
        const binding2 = ctx.getSync<Store>(STORE_KEY).binding;
        expect(binding1).to.not.be.exactly(binding2);
      });

      it('supports NEVER_CREATE - throws if not bound', () => {
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.NEVER_CREATE));
        expect(() => ctx.getSync<Store>(STORE_KEY)).to.throw(
          /The key 'hash' is not bound to any value in context/,
        );
      });

      it('supports NEVER_CREATE with an existing binding', () => {
        // Create a binding for hash key
        const hashBinding = ctx
          .bind(HASH_KEY)
          .to('123')
          .tag('hash');
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.NEVER_CREATE));
        const store = ctx.getSync<Store>(STORE_KEY);
        expect(store.binding).to.be.exactly(hashBinding);
      });

      it('supports CREATE_IF_NOT_BOUND without an existing binding', async () => {
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.CREATE_IF_NOT_BOUND));
        const store = ctx.getSync<Store>(STORE_KEY);
        expect(store.binding).to.be.instanceOf(Binding);
      });

      it('supports CREATE_IF_NOT_BOUND with an existing binding', () => {
        // Create a binding for hash key
        const hashBinding = ctx
          .bind(HASH_KEY)
          .to('123')
          .tag('hash');
        ctx
          .bind(STORE_KEY)
          .toClass(givenStoreClass(BindingCreationPolicy.CREATE_IF_NOT_BOUND));
        const store = ctx.getSync<Store>(STORE_KEY);
        expect(store.binding).to.be.exactly(hashBinding);
      });

      function givenStoreClass(bindingCreation?: BindingCreationPolicy) {
        class StoreWithInjectBindingMetadata {
          constructor(
            @inject.binding(HASH_KEY, {bindingCreation})
            public binding: Binding<string>,
          ) {}
        }
        return StoreWithInjectBindingMetadata;
      }
    });
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

  it('reports correct resolution path when injecting values by tag', async () => {
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

  it('injects a config property', () => {
    class Store {
      constructor(
        @config('x') public optionX: number,
        @config('y') public optionY: string,
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
      constructor(@config('x') public optionX: number) {}
    }

    ctx.configure('store').toDynamicValue(() => Promise.resolve({x: 1}));
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
      constructor(@config('myOption') public myOption: string) {}
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
      constructor(@config('x') public optionX: number) {}
    }

    ctx
      .configure('store')
      .toDynamicValue(() => Promise.reject(Error('invalid')));

    ctx.bind('store').toClass(Store);

    await expect(ctx.get('store')).to.be.rejectedWith('invalid');
  });

  it('injects a config property with nested property', () => {
    class Store {
      constructor(@config('x.y') public optionXY: string) {}
    }

    ctx.configure('store').to({x: {y: 'y'}});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.optionXY).to.eql('y');
  });

  it('injects config if the propertyPath is not present', () => {
    class Store {
      constructor(@config() public configObj: object) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.configObj).to.eql({x: 1, y: 'a'});
  });

  it("injects config if the propertyPath is ''", () => {
    class Store {
      constructor(@config('') public configObj: object) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.configObj).to.eql({x: 1, y: 'a'});
  });

  it('injects config with propertyPath', () => {
    class Store {
      constructor(@config('x') public optionX: number) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.optionX).to.eql(1);
  });

  it('injects undefined option if propertyPath not found', () => {
    class Store {
      constructor(@config('not-exist') public option: string | undefined) {}
    }

    ctx.configure('store').to({x: 1, y: 'a'});
    ctx.bind('store').toClass(Store);
    const store: Store = ctx.getSync('store');
    expect(store.option).to.be.undefined();
  });

  it('injects a config property for different bindings with the same class', async () => {
    class Store {
      constructor(
        @config('x') public optionX: number,
        @config('y') public optionY: string,
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
      constructor(@config('x') public settings: object | undefined) {}
    }

    const store = await instantiateClass(Store, ctx);
    expect(store.settings).to.be.undefined();
  });

  it('injects config from config binding', () => {
    class MyStore {
      constructor(@config('x') public optionX: number) {}
    }

    ctx.configure('stores.MyStore').to({x: 1, y: 'a'});
    ctx.bind('stores.MyStore').toClass(MyStore);

    const store: MyStore = ctx.getSync('stores.MyStore');
    expect(store.optionX).to.eql(1);
  });

  function createContext() {
    ctx = new Context();
  }
});
