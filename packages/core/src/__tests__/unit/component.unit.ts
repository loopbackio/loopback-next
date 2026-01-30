// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  BindingScope,
  Constructor,
  injectable,
  Provider,
} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  Application,
  Component,
  CoreTags,
  LifeCycleObserver,
  mountComponent,
  Server,
} from '../..';

describe('Component', () => {
  let app: Application;

  beforeEach(givenApp);
  afterEach(() => app.stop());

  describe('mountComponent', () => {
    it('binds classes from component', () => {
      class MyClass {
        value = 'my-class';
      }

      const component: Component = {
        classes: {
          'my.class': MyClass,
        },
      };

      mountComponent(app, component);

      const binding = app.getBinding('my.class');
      expect(binding).to.be.ok();
      expect(binding.valueConstructor).to.equal(MyClass);
    });

    it('binds multiple classes from component', () => {
      class ClassA {
        value = 'a';
      }
      class ClassB {
        value = 'b';
      }

      const component: Component = {
        classes: {
          'class.a': ClassA,
          'class.b': ClassB,
        },
      };

      mountComponent(app, component);

      expect(app.getSync('class.a')).to.be.instanceOf(ClassA);
      expect(app.getSync('class.b')).to.be.instanceOf(ClassB);
    });

    it('binds providers from component', () => {
      class MyProvider implements Provider<string> {
        value() {
          return 'my-value';
        }
      }

      const component: Component = {
        providers: {
          'my.provider': MyProvider,
        },
      };

      mountComponent(app, component);

      const binding = app.getBinding('my.provider');
      expect(binding).to.be.ok();
      expect(binding.providerConstructor).to.equal(MyProvider);
    });

    it('binds multiple providers from component', () => {
      class ProviderA implements Provider<string> {
        value() {
          return 'a';
        }
      }
      class ProviderB implements Provider<string> {
        value() {
          return 'b';
        }
      }

      const component: Component = {
        providers: {
          'provider.a': ProviderA,
          'provider.b': ProviderB,
        },
      };

      mountComponent(app, component);

      expect(app.getSync('provider.a')).to.equal('a');
      expect(app.getSync('provider.b')).to.equal('b');
    });

    it('binds bindings from component', () => {
      const binding1 = Binding.bind('my.key1').to('value1');
      const binding2 = Binding.bind('my.key2').to('value2');

      const component: Component = {
        bindings: [binding1, binding2],
      };

      mountComponent(app, component);

      expect(app.getSync('my.key1')).to.equal('value1');
      expect(app.getSync('my.key2')).to.equal('value2');
    });

    it('binds controllers from component', () => {
      class MyController {
        greet() {
          return 'hello';
        }
      }

      const component: Component = {
        controllers: [MyController],
      };

      mountComponent(app, component);

      const binding = app.getBinding('controllers.MyController');
      expect(binding).to.be.ok();
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.CONTROLLER);
    });

    it('binds multiple controllers from component', () => {
      class ControllerA {}
      class ControllerB {}

      const component: Component = {
        controllers: [ControllerA, ControllerB],
      };

      mountComponent(app, component);

      expect(app.getBinding('controllers.ControllerA')).to.be.ok();
      expect(app.getBinding('controllers.ControllerB')).to.be.ok();
    });

    it('binds servers from component', () => {
      class MyServer implements Server {
        listening = false;
        async start() {
          this.listening = true;
        }
        async stop() {
          this.listening = false;
        }
      }

      const component: Component = {
        servers: {
          myServer: MyServer,
        },
      };

      mountComponent(app, component);

      const binding = app.getBinding('servers.myServer');
      expect(binding).to.be.ok();
      expect(Array.from(binding.tagNames)).to.containEql(CoreTags.SERVER);
    });

    it('binds multiple servers from component', () => {
      class ServerA implements Server {
        listening = false;
        async start() {}
        async stop() {}
      }
      class ServerB implements Server {
        listening = false;
        async start() {}
        async stop() {}
      }

      const component: Component = {
        servers: {
          serverA: ServerA,
          serverB: ServerB,
        },
      };

      mountComponent(app, component);

      expect(app.getBinding('servers.serverA')).to.be.ok();
      expect(app.getBinding('servers.serverB')).to.be.ok();
    });

    it('binds life cycle observers from component', () => {
      class MyObserver implements LifeCycleObserver {
        async start() {}
        async stop() {}
      }

      const component: Component = {
        lifeCycleObservers: [MyObserver],
      };

      mountComponent(app, component);

      const bindings = app.findByTag(CoreTags.LIFE_CYCLE_OBSERVER);
      expect(bindings).to.have.length(1);
      expect(bindings[0].valueConstructor).to.equal(MyObserver);
    });

    it('binds multiple life cycle observers from component', () => {
      class ObserverA implements LifeCycleObserver {
        async start() {}
      }
      class ObserverB implements LifeCycleObserver {
        async stop() {}
      }

      const component: Component = {
        lifeCycleObservers: [ObserverA, ObserverB],
      };

      mountComponent(app, component);

      const bindings = app.findByTag(CoreTags.LIFE_CYCLE_OBSERVER);
      expect(bindings).to.have.length(2);
    });

    it('binds services from component', () => {
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {
        getValue() {
          return 'service-value';
        }
      }

      const component: Component = {
        services: [MyService],
      };

      mountComponent(app, component);

      const bindings = app.findByTag(CoreTags.SERVICE);
      expect(bindings).to.have.length(1);
      expect(bindings[0].valueConstructor).to.equal(MyService);
    });

    it('binds multiple services from component', () => {
      @injectable({scope: BindingScope.SINGLETON})
      class ServiceA {
        name = 'a';
      }
      @injectable({scope: BindingScope.SINGLETON})
      class ServiceB {
        name = 'b';
      }

      const component: Component = {
        services: [ServiceA, ServiceB],
      };

      mountComponent(app, component);

      const bindings = app.findByTag(CoreTags.SERVICE);
      expect(bindings.length).to.be.greaterThanOrEqual(2);
    });

    it('binds nested components from component', () => {
      class NestedComponent implements Component {
        classes = {
          'nested.class': class NestedClass {},
        };
      }

      const component: Component = {
        components: [NestedComponent],
      };

      mountComponent(app, component);

      expect(app.getBinding('nested.class')).to.be.ok();
      expect(app.getBinding('components.NestedComponent')).to.be.ok();
    });

    it('prevents infinite recursion when component references itself', () => {
      class SelfReferencingComponent implements Component {
        components?: Constructor<Component>[];
      }

      const component = new SelfReferencingComponent();
      component.components = [SelfReferencingComponent];

      // Should not throw or cause infinite loop
      mountComponent(app, component);

      const bindings = app.findByTag(CoreTags.COMPONENT);
      // Should only bind once
      expect(bindings).to.have.length(1);
    });

    it('mounts component with all artifact types', () => {
      class MyClass {}
      class MyProvider implements Provider<string> {
        value() {
          return 'provided';
        }
      }
      class MyController {}
      class MyServer implements Server {
        listening = false;
        async start() {}
        async stop() {}
      }
      class MyObserver implements LifeCycleObserver {
        async start() {}
      }
      @injectable({scope: BindingScope.SINGLETON})
      class MyService {}

      const binding = Binding.bind('custom.key').to('custom-value');

      const component: Component = {
        classes: {'my.class': MyClass},
        providers: {'my.provider': MyProvider},
        controllers: [MyController],
        servers: {myServer: MyServer},
        lifeCycleObservers: [MyObserver],
        services: [MyService],
        bindings: [binding],
      };

      mountComponent(app, component);

      expect(app.getBinding('my.class')).to.be.ok();
      expect(app.getBinding('my.provider')).to.be.ok();
      expect(app.getBinding('controllers.MyController')).to.be.ok();
      expect(app.getBinding('servers.myServer')).to.be.ok();
      expect(app.getBinding('custom.key')).to.be.ok();
      expect(
        app.findByTag(CoreTags.LIFE_CYCLE_OBSERVER).length,
      ).to.be.greaterThan(0);
      expect(app.findByTag(CoreTags.SERVICE).length).to.be.greaterThan(0);
    });

    it('handles empty component', () => {
      const component: Component = {};
      // Should not throw
      mountComponent(app, component);
    });

    it('handles component with undefined properties', () => {
      const component: Component = {
        classes: undefined,
        providers: undefined,
        controllers: undefined,
        servers: undefined,
        lifeCycleObservers: undefined,
        services: undefined,
        bindings: undefined,
        components: undefined,
      };
      // Should not throw
      mountComponent(app, component);
    });

    it('handles component with empty arrays and objects', () => {
      const component: Component = {
        classes: {},
        providers: {},
        controllers: [],
        servers: {},
        lifeCycleObservers: [],
        services: [],
        bindings: [],
        components: [],
      };
      // Should not throw
      mountComponent(app, component);
    });

    it('preserves binding metadata when mounting classes', () => {
      @injectable({scope: BindingScope.SINGLETON, tags: ['custom-tag']})
      class MyClass {}

      const component: Component = {
        classes: {'my.class': MyClass},
      };

      mountComponent(app, component);

      const binding = app.getBinding('my.class');
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(Array.from(binding.tagNames)).to.containEql('custom-tag');
    });

    it('preserves binding metadata when mounting providers', () => {
      @injectable({scope: BindingScope.SINGLETON, tags: ['provider-tag']})
      class MyProvider implements Provider<string> {
        value() {
          return 'value';
        }
      }

      const component: Component = {
        providers: {'my.provider': MyProvider},
      };

      mountComponent(app, component);

      const binding = app.getBinding('my.provider');
      expect(binding.scope).to.equal(BindingScope.SINGLETON);
      expect(Array.from(binding.tagNames)).to.containEql('provider-tag');
    });
  });

  describe('Component interface', () => {
    it('allows custom properties', () => {
      const component: Component = {
        customProperty: 'custom-value',
        anotherProperty: 123,
      };

      expect(component.customProperty).to.equal('custom-value');
      expect(component.anotherProperty).to.equal(123);
    });

    it('supports all optional properties', () => {
      const component: Component = {};

      expect(component.controllers).to.be.undefined();
      expect(component.providers).to.be.undefined();
      expect(component.classes).to.be.undefined();
      expect(component.servers).to.be.undefined();
      expect(component.lifeCycleObservers).to.be.undefined();
      expect(component.services).to.be.undefined();
      expect(component.bindings).to.be.undefined();
      expect(component.components).to.be.undefined();
    });
  });

  function givenApp() {
    app = new Application();
  }
});

// Made with Bob
