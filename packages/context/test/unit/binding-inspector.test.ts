// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  bind,
  BindingScope,
  BindingScopeAndTags,
  Constructor,
  Context,
  createBindingFromClass,
  Provider,
} from '../..';
import {BindingFromClassOptions} from '../../src';

describe('createBindingFromClass()', () => {
  it('inspects classes', () => {
    const spec: BindingScopeAndTags = {
      tags: {type: 'controller', name: 'my-controller', rest: 'rest'},
      scope: BindingScope.SINGLETON,
    };

    @bind(spec)
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

  it('inspects classes without @bind', () => {
    class MyController {}

    const ctx = new Context();
    const binding = givenBindingFromClass(MyController, ctx);

    expect(binding.key).to.eql('classes.MyController');
    expect(ctx.getSync(binding.key)).to.be.instanceof(MyController);
  });

  it('supports options to customize class bindings with @bind', () => {
    const spec: BindingScopeAndTags = {
      tags: {name: 'my-controller', rest: 'rest'},
      scope: BindingScope.SINGLETON,
    };

    @bind(spec)
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

  it('supports options to customize class bindings without @bind', () => {
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

    @bind.provider(spec)
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

    @bind(spec)
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

  it('recognizes provider classes without @bind', () => {
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

  it('honors the binding key', () => {
    const spec: BindingScopeAndTags = {
      tags: {
        type: 'controller',
        key: 'controllers.my',
        name: 'my-controller',
      },
    };

    @bind(spec)
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

    @bind(spec)
    class MyClass {}

    const binding = givenBindingFromClass(MyClass);
    expect(binding.key).to.eql('classes.MyClass');
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
