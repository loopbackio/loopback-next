// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  injectable,
  getInjectableMetadata,
  BindingScope,
  InjectableMetadata,
  Context,
  Provider,
} from '../..';
import {bindInjectable, provider} from '../../src/injectable';

describe('@injectable', () => {
  it('decorates a class', () => {
    const spec: InjectableMetadata = {
      type: 'controller',
      name: 'my-controller',
      tags: ['rest'],
      scope: BindingScope.SINGLETON,
    };

    @injectable(spec)
    class MyController {}

    expect(getInjectableMetadata(MyController)).to.eql(spec);
  });

  it('has to be on the target class', () => {
    const spec: InjectableMetadata = {
      type: 'controller',
      name: 'my-controller',
      tags: ['rest'],
      scope: BindingScope.SINGLETON,
    };

    @injectable(spec)
    class MyController {}

    class MySubController extends MyController {}

    expect(getInjectableMetadata(MySubController)).to.be.undefined();
  });

  it('inherits attributes except name from the base class', () => {
    const spec: InjectableMetadata = {
      type: 'controller',
      name: 'my-controller',
      tags: ['rest'],
      scope: BindingScope.SINGLETON,
    };

    @injectable(spec)
    class MyController {}

    @injectable()
    class MySubController extends MyController {}

    expect(getInjectableMetadata(MySubController)).to.eql({
      type: 'controller',
      tags: ['rest'],
      scope: BindingScope.SINGLETON,
    });
  });

  it('decorates a provider classes', () => {
    const spec = {
      type: 'provider',
      tags: ['rest'],
      scope: BindingScope.CONTEXT,
    };

    @provider(spec)
    class MyProvider implements Provider<string> {
      value() {
        return 'my-value';
      }
    }
    expect(getInjectableMetadata(MyProvider)).to.eql({
      type: 'provider',
      tags: ['rest'],
      scope: BindingScope.CONTEXT,
    });
  });
});

describe('bindInjectable()', () => {
  it('binds injectable classes', () => {
    const spec: InjectableMetadata = {
      type: 'controller',
      name: 'my-controller',
      tags: ['rest'],
      scope: BindingScope.SINGLETON,
    };

    @injectable(spec)
    class MyController {}

    const ctx = new Context();
    const binding = bindInjectable(ctx, MyController);
    expect(binding.key).to.eql('controllers.my-controller');
    expect(binding.scope).to.eql(spec.scope);
    expect(Array.from(binding.tagNames)).to.containDeep(spec.tags);
    expect(binding.tagMap).to.containDeep({
      name: 'my-controller',
      type: 'controller',
      controller: 'my-controller',
    });
    expect(ctx.getSync(binding.key)).to.be.instanceof(MyController);
  });

  it('binds injectable provider classes', () => {
    const spec: InjectableMetadata = {
      type: 'provider',
      tags: ['rest'],
      scope: BindingScope.CONTEXT,
    };

    @injectable(spec)
    class MyProvider implements Provider<string> {
      value() {
        return 'my-value';
      }
    }

    const ctx = new Context();
    const binding = bindInjectable(ctx, MyProvider);
    expect(binding.key).to.eql('providers.MyProvider');
    expect(binding.scope).to.eql(spec.scope);
    expect(Array.from(binding.tagNames)).to.containDeep(spec.tags);
    expect(binding.tagMap).to.containDeep({
      name: 'MyProvider',
      type: 'provider',
      provider: 'MyProvider',
    });
    expect(ctx.getSync(binding.key)).to.eql('my-value');
  });

  it('honors the binding key', () => {
    const spec: InjectableMetadata = {
      type: 'controller',
      key: 'controllers.my',
      name: 'my-controller',
    };

    @injectable(spec)
    class MyController {}

    const ctx = new Context();
    const binding = bindInjectable(ctx, MyController);
    expect(binding.key).to.eql('controllers.my');

    expect(binding.tagMap).to.containDeep({
      name: 'my-controller',
      type: 'controller',
      controller: 'my-controller',
    });
  });

  it('defaults type to class', () => {
    const spec: InjectableMetadata = {};

    @injectable(spec)
    class MyClass {}

    const ctx = new Context();
    const binding = bindInjectable(ctx, MyClass);
    expect(binding.key).to.eql('classes.MyClass');

    expect(binding.tagMap).to.containDeep({
      name: 'MyClass',
      type: 'class',
      class: 'MyClass',
    });
  });
});
