// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {
  Context,
  inject,
  Setter,
  Getter,
  instantiateClass,
  ResolutionSession,
  Injection,
  Provider,
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
      @inject('authenticated') public isAuthenticated: boolean;
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

      @inject('authenticated') public isAuthenticated: boolean;
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
    const store = ctx.getSync('store');

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
    const store = ctx.getSync('store');

    expect(store.setter).to.be.Function();
    store.setter('a-value');
    expect(ctx.getSync('key')).to.equal('a-value');
  });

  it('injects a nested property', async () => {
    class TestComponent {
      constructor(@inject('config#test') public config: string) {}
    }

    ctx.bind('config').to({test: 'test-config'});
    ctx.bind('component').toClass(TestComponent);

    const resolved = await ctx.get('component');
    expect(resolved.config).to.equal('test-config');
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
      constructor(
        @inject.tag(/.+:location:sj/)
        public locations: string[],
      ) {}
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
    const store: Store = await ctx.get('store');
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
    const store: Store = await ctx.get('store');
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

  it('injects an option', () => {
    class Store {
      constructor(
        @inject.options('x') public optionX: number,
        @inject.options('y') public optionY: string,
      ) {}
    }

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions({x: 1, y: 'a'});
    const store = ctx.getSync('store');
    expect(store.optionX).to.eql(1);
    expect(store.optionY).to.eql('a');
  });

  it('injects an option with promise value', async () => {
    class Store {
      constructor(@inject.options('x') public optionX: number) {}
    }

    const options = new Context();
    options.bind('x').toDynamicValue(async () => 1);
    ctx
      .bind('store')
      .toClass(Store)
      .withOptions(options);
    const store = await ctx.get('store');
    expect(store.optionX).to.eql(1);
  });

  it('injects an option with a binding provider', async () => {
    class MyOptionProvider implements Provider<string> {
      constructor(@inject('prefix') private prefix: string) {}
      value() {
        return this.prefix + 'my-option';
      }
    }

    class Store {
      constructor(@inject.options('myOption') public myOption: string) {}
    }

    ctx.bind('options.MyOptionProvider').toProvider(MyOptionProvider);

    const options = new Context();
    options.bind('myOption').toDynamicValue(() => {
      return ctx.get('options.MyOptionProvider');
    });
    ctx.bind('prefix').to('hello-');
    ctx
      .bind('store')
      .toClass(Store)
      .withOptions(options);

    const store = await ctx.get('store');
    expect(store.myOption).to.eql('hello-my-option');
  });

  it('injects an option with a rejected promise', async () => {
    class Store {
      constructor(@inject.options('x') public optionX: number) {}
    }

    const options = new Context();
    options.bind('x').toDynamicValue(() => Promise.reject(Error('invalid')));

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions(options);

    await expect(ctx.get('store')).to.be.rejectedWith('invalid');
  });

  it('injects an option when `options` is a context', async () => {
    class Store {
      constructor(@inject.options('x') public optionX: number) {}
    }

    const options = new Context();
    options.bind('x').toDynamicValue(() => Promise.resolve(1));
    ctx
      .bind('store')
      .toClass(Store)
      .withOptions(options);
    const store = await ctx.get('store');
    expect(store.optionX).to.eql(1);
  });

  it('injects an option.property when `options` is a context', async () => {
    class Store {
      constructor(@inject.options('x#y') public optionY: string) {}
    }

    const options = new Context();
    options.bind('x').toDynamicValue(() => Promise.resolve({y: 'y'}));
    ctx
      .bind('store')
      .toClass(Store)
      .withOptions(options);
    const store = await ctx.get('store');
    expect(store.optionY).to.eql('y');
  });

  it('injects an option with nested property', () => {
    class Store {
      constructor(@inject.options('x#y') public optionXY: string) {}
    }

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions({x: {y: 'y'}});
    const store = ctx.getSync('store');
    expect(store.optionXY).to.eql('y');
  });

  it('injects options if the binding key is not present', () => {
    class Store {
      constructor(@inject.options() public options: object) {}
    }

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions({x: 1, y: 'a'});
    const store = ctx.getSync('store');
    expect(store.options).to.eql({x: 1, y: 'a'});
  });

  it("injects options if the binding key is ''", () => {
    class Store {
      constructor(@inject.options('') public options: object) {}
    }

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions({x: 1, y: 'a'});
    const store = ctx.getSync('store');
    expect(store.options).to.eql({x: 1, y: 'a'});
  });

  it('injects options if the binding key is a path', () => {
    class Store {
      constructor(@inject.options('#x') public optionX: number) {}
    }

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions({x: 1, y: 'a'});
    const store = ctx.getSync('store');
    expect(store.optionX).to.eql(1);
  });

  it('injects undefined option if key not found', () => {
    class Store {
      constructor(
        // tslint:disable-next-line:no-any
        @inject.options('not-exist') public option: string | undefined,
      ) {}
    }

    ctx
      .bind('store')
      .toClass(Store)
      .withOptions({x: 1, y: 'a'});
    const store = ctx.getSync('store');
    expect(store.option).to.be.undefined();
  });

  it('injects an option based on the parent binding', async () => {
    class Store {
      constructor(
        @inject.options('x') public optionX: number,
        @inject.options('y') public optionY: string,
      ) {}
    }

    ctx
      .bind('store1')
      .toClass(Store)
      .withOptions({x: 1, y: 'a'});

    ctx
      .bind('store2')
      .toClass(Store)
      .withOptions({x: 2, y: 'b'});

    const store1 = await ctx.get('store1');
    expect(store1.optionX).to.eql(1);
    expect(store1.optionY).to.eql('a');

    const store2 = await ctx.get('store2');
    expect(store2.optionX).to.eql(2);
    expect(store2.optionY).to.eql('b');
  });

  it('injects undefined option if no binding is present', async () => {
    class Store {
      constructor(
        // tslint:disable-next-line:no-any
        @inject.options('x') public option: string | undefined,
      ) {}
    }

    const store = await instantiateClass(Store, ctx);
    expect(store.option).to.be.undefined();
  });

  function createContext() {
    ctx = new Context();
  }
});
