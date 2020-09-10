// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  BindingFromClassOptions,
  BindingScope,
  BindingScopeAndTags,
  Constructor,
  Context,
  ContextTags,
  createBindingFromClass,
  injectable,
  isProviderClass,
  Provider,
} from '../..';
import {inject} from '../../inject';

describe('createBindingFromClass()', () => {
  it('inspects classes', () => {
    const spec: BindingScopeAndTags = {
      tags: {type: 'controller', name: 'my-controller', rest: 'rest'},
      scope: BindingScope.SINGLETON,
    };

    @injectable(spec)
    class MyController {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyController, ctx);

    expect(binding.scope).to.eql(spec.scope);
    expect(binding.tagMap).to.containEql({
      name: 'my-controller',
      type: 'controller',
      rest: 'rest',
    });
    expect(ctx.getSync(binding.key)).to.be.instanceof(MyController);
  });

  it('inspects classes without @injectable', () => {
    class MyController {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyController, ctx);

    expect(binding.key).to.eql('classes.MyController');
    expect(ctx.getSync(binding.key)).to.be.instanceof(MyController);
  });

  it('supports options to customize class bindings with @injectable', () => {
    const spec: BindingScopeAndTags = {
      tags: {name: 'my-controller', rest: 'rest'},
      scope: BindingScope.SINGLETON,
    };

    @injectable(spec)
    class MyController {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyController, ctx, {
      key: 'controllers.controller1',
    });

    expect(binding.key).to.eql('controllers.controller1');
    expect(binding.tagMap).to.containEql({
      name: 'my-controller',
      rest: 'rest',
    });
  });

  it('supports options to customize class bindings without @injectable', () => {
    class MyController {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyController, ctx, {
      type: 'controller',
      namespace: 'controllers',
      name: 'my-controller',
    });

    expect(binding.key).to.eql('controllers.my-controller');
    expect(binding.tagMap).to.containEql({
      controller: 'controller',
      name: 'my-controller',
      type: 'controller',
    });
    expect(ctx.getSync(binding.key)).to.be.instanceof(MyController);
  });

  it('inspects provider classes', () => {
    const spec = {
      tags: ['rest'],
      scope: BindingScope.CONTEXT,
    };

    @injectable.provider(spec)
    class MyProvider implements Provider<string> {
      value() {
        return 'my-value';
      }
    }

    const ctx = new Context();
    const binding = givenBindingFromClass(MyProvider, ctx);

    expect(binding.key).to.eql('providers.MyProvider');
    expect(binding.scope).to.eql(spec.scope);
    expect(binding.tagMap).to.containDeep({
      type: 'provider',
      provider: 'provider',
      rest: 'rest',
    });
    expect(ctx.getSync(binding.key)).to.eql('my-value');
  });

  it('recognizes provider classes', () => {
    const spec = {
      tags: ['rest', {type: 'provider'}],
      scope: BindingScope.CONTEXT,
    };

    @injectable(spec)
    class MyProvider implements Provider<string> {
      value() {
        return 'my-value';
      }
    }

    const ctx = new Context();
    const binding = givenBindingFromClass(MyProvider, ctx);

    expect(binding.key).to.eql('providers.MyProvider');
    expect(binding.scope).to.eql(spec.scope);
    expect(binding.tagMap).to.containDeep({
      type: 'provider',
      provider: 'provider',
      rest: 'rest',
    });
    expect(ctx.getSync(binding.key)).to.eql('my-value');
  });

  it('recognizes provider classes without @injectable', () => {
    class MyProvider implements Provider<string> {
      value() {
        return 'my-value';
      }
    }

    const ctx = new Context();
    const binding = givenBindingFromClass(MyProvider, ctx);
    expect(binding.key).to.eql('providers.MyProvider');
    expect(ctx.getSync(binding.key)).to.eql('my-value');
  });

  it('inspects dynamic value provider classes', () => {
    const spec = {
      tags: ['rest'],
      scope: BindingScope.CONTEXT,
    };

    @injectable(spec)
    class MyProvider {
      static value() {
        return 'my-value';
      }
    }

    const ctx = new Context();
    const binding = givenBindingFromClass(MyProvider, ctx);

    expect(binding.key).to.eql('dynamicValueProviders.MyProvider');
    expect(binding.scope).to.eql(spec.scope);
    expect(binding.tagMap).to.containDeep({
      type: 'dynamicValueProvider',
      dynamicValueProvider: 'dynamicValueProvider',
      rest: 'rest',
    });
    expect(ctx.getSync(binding.key)).to.eql('my-value');
  });

  it('recognizes dynamic value provider classes', () => {
    const spec = {
      tags: ['rest', {type: 'dynamicValueProvider'}],
      scope: BindingScope.CONTEXT,
    };

    @injectable(spec)
    class MyProvider {
      static value(@inject('prefix') prefix: string) {
        return `[${prefix}] my-value`;
      }
    }

    const ctx = new Context();
    ctx.bind('prefix').to('abc');
    const binding = givenBindingFromClass(MyProvider, ctx);

    expect(binding.key).to.eql('dynamicValueProviders.MyProvider');
    expect(binding.scope).to.eql(spec.scope);
    expect(binding.tagMap).to.containDeep({
      type: 'dynamicValueProvider',
      dynamicValueProvider: 'dynamicValueProvider',
      rest: 'rest',
    });
    expect(ctx.getSync(binding.key)).to.eql('[abc] my-value');
  });

  it('recognizes dynamic value provider classes without @injectable', () => {
    class MyProvider {
      static value() {
        return 'my-value';
      }
    }

    const ctx = new Context();
    const binding = givenBindingFromClass(MyProvider, ctx);
    expect(binding.key).to.eql('dynamicValueProviders.MyProvider');
    expect(ctx.getSync(binding.key)).to.eql('my-value');
  });

  it('honors the binding key', () => {
    const spec: BindingScopeAndTags = {
      tags: {
        type: 'controller',
        key: 'controllers.my',
        name: 'my-controller',
      },
    };

    @injectable(spec)
    class MyController {}

    const binding = givenBindingFromClass(MyController);

    expect(binding.key).to.eql('controllers.my');

    expect(binding.tagMap).to.eql({
      name: 'my-controller',
      type: 'controller',
      key: 'controllers.my',
    });
  });

  it('defaults type to class', () => {
    const spec: BindingScopeAndTags = {};

    @injectable(spec)
    class MyClass {}

    const binding = givenBindingFromClass(MyClass);
    expect(binding.key).to.eql('classes.MyClass');
  });

  it('honors namespace with @injectable', () => {
    @injectable({tags: {namespace: 'services'}})
    class MyService {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyService, ctx);

    expect(binding.key).to.eql('services.MyService');
  });

  it('honors namespace with options', () => {
    class MyService {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyService, ctx, {
      namespace: 'services',
    });

    expect(binding.key).to.eql('services.MyService');
  });

  it('honors default namespace with options', () => {
    class MyService {}

    @injectable({tags: {[ContextTags.NAMESPACE]: 'my-services'}})
    class MyServiceWithNS {}

    const ctx = new Context();
    let binding = givenBindingFromClass(MyService, ctx, {
      defaultNamespace: 'services',
    });

    expect(binding.key).to.eql('services.MyService');

    binding = givenBindingFromClass(MyService, ctx, {
      namespace: 'my-services',
      defaultNamespace: 'services',
    });

    expect(binding.key).to.eql('my-services.MyService');

    binding = givenBindingFromClass(MyServiceWithNS, ctx, {
      defaultNamespace: 'services',
    });

    expect(binding.key).to.eql('my-services.MyServiceWithNS');
  });

  it('includes class name in error messages', () => {
    expect(() => {
      // Reproduce a problem that @bajtos encountered when the project
      // was not built correctly and somehow `@injectable` was called with `undefined`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      @injectable(undefined as any)
      class MyClass {}

      return createBindingFromClass(MyClass);
    }).to.throw(/(while building binding for class MyClass)/);
  });

  function givenBindingFromClass(
    cls: Constructor<unknown>,
    ctx: Context = new Context(),
    options: BindingFromClassOptions = {},
  ) {
    const binding = createBindingFromClass(cls, options);
    ctx.add(binding);
    return binding;
  }
});

describe('isProviderClass', () => {
  describe('non-functions', () => {
    assertNotProviderClasses(undefined, null, 'abc', 1, true, false, {x: 1});
  });

  describe('functions that do not have value()', () => {
    function fn() {}
    class MyClass {}
    class MyClassWithVal {
      value = 'abc';
    }
    assertNotProviderClasses(String, Date, fn, MyClass, MyClassWithVal);
  });

  describe('functions that have value()', () => {
    class MyProvider {
      value() {
        return 'abc';
      }
    }

    class MyAsyncProvider {
      value() {
        return Promise.resolve('abc');
      }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    function MyJsProvider() {}

    MyJsProvider.prototype.value = function () {
      return 'abc';
    };

    assertProviderClasses(MyProvider, MyAsyncProvider, MyJsProvider);
  });

  function assertNotProviderClasses(...values: unknown[]) {
    for (const v of values) {
      it(`recognizes ${v} is not a provider class`, () => {
        expect(isProviderClass(v)).to.be.false();
      });
    }
  }

  function assertProviderClasses(...values: unknown[]) {
    for (const v of values) {
      it(`recognizes ${v} is a provider class`, () => {
        expect(isProviderClass(v)).to.be.true();
      });
    }
  }
});
