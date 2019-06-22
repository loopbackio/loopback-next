// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  bind,
  BindingScope,
  Context,
  createBindingFromClass,
  Provider,
} from '../..';

describe('@bind - customize classes with binding attributes', () => {
  @bind({
    scope: BindingScope.SINGLETON,
    tags: ['service'],
  })
  class MyService {}

  @bind.provider({
    tags: {
      key: 'my-date-provider',
    },
  })
  class MyDateProvider implements Provider<Date> {
    value() {
      return new Date();
    }
  }

  @bind({
    tags: ['controller', {name: 'my-controller', type: 'controller'}],
  })
  class MyController {}

  const discoveredClasses = [MyService, MyDateProvider, MyController];

  it('allows discovery of classes to be bound', () => {
    const ctx = new Context();
    discoveredClasses.forEach(c => {
      const binding = createBindingFromClass(c);
      if (binding.tagMap.controller) {
        ctx.add(binding);
      }
    });
    expect(ctx.findByTag('controller').map(b => b.key)).eql([
      'controllers.my-controller',
    ]);
    expect(ctx.find().map(b => b.key)).eql(['controllers.my-controller']);
  });

  it('allows binding attributes to be customized', () => {
    const ctx = new Context();
    discoveredClasses.forEach(c => {
      const binding = createBindingFromClass(c, {
        typeNamespaceMapping: {
          controller: 'controllers',
          service: 'service-proxies',
        },
      });
      ctx.add(binding);
    });
    expect(ctx.findByTag('provider').map(b => b.key)).eql(['my-date-provider']);
    expect(ctx.getBinding('service-proxies.MyService').scope).to.eql(
      BindingScope.SINGLETON,
    );
    expect(ctx.find().map(b => b.key)).eql([
      'service-proxies.MyService',
      'my-date-provider',
      'controllers.my-controller',
    ]);
  });

  it('supports default binding scope in options', () => {
    const binding = createBindingFromClass(MyController, {
      defaultScope: BindingScope.SINGLETON,
    });
    expect(binding.scope).to.equal(BindingScope.SINGLETON);
  });

  describe('binding scope', () => {
    @bind({
      // Explicitly set the binding scope to be `SINGLETON` as the developer
      // choose to implement the controller as a singleton without depending
      // on request specific information
      scope: BindingScope.SINGLETON,
    })
    class MySingletonController {}

    it('allows singleton controller with @bind', () => {
      const binding = createBindingFromClass(MySingletonController, {
        type: 'controller',
      });
      expect(binding.key).to.equal('controllers.MySingletonController');
      expect(binding.tagMap).to.containEql({controller: 'controller'});
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
    });

    it('honors binding scope from @bind over defaultScope', () => {
      const binding = createBindingFromClass(MySingletonController, {
        defaultScope: BindingScope.TRANSIENT,
      });
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
    });

    it('honors binding scope from @bind', () => {
      const binding = createBindingFromClass(MySingletonController);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
    });
  });
});
