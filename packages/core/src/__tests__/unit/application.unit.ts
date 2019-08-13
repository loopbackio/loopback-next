// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  BindingScope,
  Context,
  inject,
  Provider,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Application, Component, CoreBindings, CoreTags, Server} from '../..';

describe('Application', () => {
  describe('controller binding', () => {
    let app: Application;
    class MyController {}

    beforeEach(givenApp);

    it('binds a controller', () => {
      const binding = app.controller(MyController);
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.CONTROLLER);
      expect(binding.key).to.equal('controllers.MyController');
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
      expect(findKeysByTag(app, CoreTags.CONTROLLER)).to.containEql(
        binding.key,
      );
    });

    it('binds a controller with custom name', () => {
      const binding = app.controller(MyController, 'my-controller');
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.CONTROLLER);
      expect(binding.key).to.equal('controllers.my-controller');
      expect(findKeysByTag(app, CoreTags.CONTROLLER)).to.containEql(
        binding.key,
      );
    });

    it('binds a singleton controller', () => {
      @bind({scope: BindingScope.SINGLETON})
      class MySingletonController {}

      const binding = app.controller(MySingletonController);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(findKeysByTag(app, 'controller')).to.containEql(binding.key);
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('component binding', () => {
    let app: Application;

    class MyComponent implements Component {}

    beforeEach(givenApp);

    it('binds a component', () => {
      const binding = app.component(MyComponent);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(findKeysByTag(app, CoreTags.COMPONENT)).to.containEql(
        'components.MyComponent',
      );
    });

    it('binds a component with custom name', () => {
      app.component(MyComponent, 'my-component');
      expect(findKeysByTag(app, CoreTags.COMPONENT)).to.containEql(
        'components.my-component',
      );
    });

    it('binds a transient component', () => {
      @bind({scope: BindingScope.TRANSIENT})
      class MyTransientComponent {}

      const binding = app.component(MyTransientComponent);
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    });

    it('binds controllers from a component', () => {
      class MyController {}

      class MyComponentWithControllers implements Component {
        controllers = [MyController];
      }

      app.component(MyComponentWithControllers);
      expect(
        app.getBinding('controllers.MyController').valueConstructor,
      ).to.be.exactly(MyController);
    });

    it('binds bindings from a component', () => {
      const binding = Binding.bind('foo');
      class MyComponentWithBindings implements Component {
        bindings = [binding];
      }

      app.component(MyComponentWithBindings);
      expect(app.getBinding('foo')).to.be.exactly(binding);
    });

    it('binds classes from a component', () => {
      class MyClass {}

      class MyComponentWithClasses implements Component {
        classes = {'my-class': MyClass};
      }

      app.component(MyComponentWithClasses);
      expect(app.contains('my-class')).to.be.true();
      expect(app.getBinding('my-class').valueConstructor).to.be.exactly(
        MyClass,
      );
      expect(app.getSync('my-class')).to.be.instanceof(MyClass);
    });

    it('binds providers from a component', () => {
      class MyProvider implements Provider<string> {
        value() {
          return 'my-str';
        }
      }

      class MyComponentWithProviders implements Component {
        providers = {'my-provider': MyProvider};
      }

      app.component(MyComponentWithProviders);
      expect(app.contains('my-provider')).to.be.true();
      expect(app.getSync('my-provider')).to.be.eql('my-str');
    });

    it('binds classes with @bind from a component', () => {
      @bind({scope: BindingScope.SINGLETON, tags: ['foo']})
      class MyClass {}

      class MyComponentWithClasses implements Component {
        classes = {'my-class': MyClass};
      }

      app.component(MyComponentWithClasses);
      const binding = app.getBinding('my-class');
      expect(binding.scope).to.eql(BindingScope.SINGLETON);
      expect(binding.tagNames).to.containEql('foo');
    });

    it('honors tags when binding providers from a component', () => {
      @bind({tags: ['foo']})
      class MyProvider implements Provider<string> {
        value() {
          return 'my-str';
        }
      }

      class MyComponentWithProviders implements Component {
        providers = {'my-provider': MyProvider};
      }

      app.component(MyComponentWithProviders);
      const binding = app.getBinding('my-provider');
      expect(binding.tagNames).to.containEql('foo');
    });

    it('binds from a component constructor', () => {
      class MyComponentWithDI implements Component {
        constructor(@inject(CoreBindings.APPLICATION_INSTANCE) ctx: Context) {
          // Programmatically bind to the context
          ctx.bind('foo').to('bar');
        }
      }

      app.component(MyComponentWithDI);
      expect(app.contains('foo')).to.be.true();
      expect(app.getSync('foo')).to.be.eql('bar');
    });

    function givenApp() {
      app = new Application();
    }
  });

  describe('server binding', () => {
    let app: Application;
    beforeEach(givenApplication);

    it('defaults to constructor name', async () => {
      const binding = app.server(FakeServer);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.SERVER);
      const result = await app.getServer(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('binds a server with a different scope than SINGLETON', async () => {
      @bind({scope: BindingScope.TRANSIENT})
      class TransientServer extends FakeServer {}

      const binding = app.server(TransientServer);
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
    });

    it('allows custom name', async () => {
      const name = 'customName';
      app.server(FakeServer, name);
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows binding of multiple servers as an array', async () => {
      const bindings = app.servers([FakeServer, AnotherServer]);
      expect(Array.from(bindings[0].tagNames)).to.containEql(CoreTags.SERVER);
      expect(Array.from(bindings[1].tagNames)).to.containEql(CoreTags.SERVER);
      const fakeResult = await app.getServer(FakeServer);
      expect(fakeResult.constructor.name).to.equal(FakeServer.name);
      const AnotherResult = await app.getServer(AnotherServer);
      expect(AnotherResult.constructor.name).to.equal(AnotherServer.name);
    });

    function givenApplication() {
      app = new Application();
    }
  });

  describe('service binding', () => {
    let app: Application;
    class MyService {}

    beforeEach(givenApp);

    it('binds a service', () => {
      const binding = app.service(MyService);
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.SERVICE);
      expect(binding.key).to.equal('services.MyService');
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
      expect(findKeysByTag(app, CoreTags.SERVICE)).to.containEql(binding.key);
    });

    it('binds a service with custom name', () => {
      const binding = app.service(MyService, 'my-service');
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.SERVICE);
      expect(binding.key).to.equal('services.my-service');
      expect(findKeysByTag(app, CoreTags.SERVICE)).to.containEql(binding.key);
    });

    it('binds a singleton service', () => {
      @bind({scope: BindingScope.SINGLETON})
      class MySingletonService {}

      const binding = app.service(MySingletonService);
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(findKeysByTag(app, 'service')).to.containEql(binding.key);
    });

    it('binds a service provider', () => {
      @bind({tags: {date: 'now', namespace: 'localServices'}})
      class MyServiceProvider implements Provider<Date> {
        value() {
          return new Date();
        }
      }

      const binding = app.service(MyServiceProvider);
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.SERVICE);
      expect(binding.tagMap.date).to.eql('now');
      expect(binding.key).to.equal('localServices.MyService');
      expect(binding.scope).to.equal(BindingScope.TRANSIENT);
      expect(findKeysByTag(app, 'service')).to.containEql(binding.key);
    });

    it('binds a service provider with name tag', () => {
      @bind({tags: {date: 'now', name: 'my-service'}})
      class MyServiceProvider implements Provider<Date> {
        value() {
          return new Date();
        }
      }

      const binding = app.service(MyServiceProvider);
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.SERVICE);
      expect(binding.tagMap.date).to.eql('now');
      expect(binding.key).to.equal('services.my-service');
      expect(findKeysByTag(app, 'service')).to.containEql(binding.key);
    });

    function givenApp() {
      app = new Application();
    }
  });

  function findKeysByTag(ctx: Context, tag: string | RegExp) {
    return ctx.findByTag(tag).map(binding => binding.key);
  }
});

class FakeServer extends Context implements Server {
  listening = false;
  constructor() {
    super();
  }
  async start(): Promise<void> {
    this.listening = true;
  }

  async stop(): Promise<void> {
    this.listening = false;
  }
}

class AnotherServer extends FakeServer {}
