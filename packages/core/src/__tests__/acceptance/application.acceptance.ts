// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, inject, Provider} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Application, Component, ControllerClass} from '../..';

describe('Bootstrapping the application', () => {
  context('with user-defined components', () => {
    it('binds all user-defined components to the application context', () => {
      class AuditComponent {}
      const app = new Application();
      app.component(AuditComponent);
      const componentKeys = app.find('components.*').map(b => b.key);
      expect(componentKeys).to.containEql('components.AuditComponent');

      const componentInstance = app.getSync('components.AuditComponent');
      expect(componentInstance).to.be.instanceOf(AuditComponent);
    });

    it('register all child components from a component', () => {
      let componentACreated = 0;
      class ComponentA implements Component {
        constructor() {
          componentACreated++;
        }
      }
      class ComponentB implements Component {}
      class ParentComponent implements Component {
        components = [ComponentA, ComponentB];
      }
      const app = new Application();
      app.component(ParentComponent);
      const componentKeys = app.find('components.*').map(b => b.key);
      expect(componentKeys).to.containEql('components.ComponentA');
      expect(componentKeys).to.containEql('components.ComponentB');
      expect(componentKeys).to.containEql('components.ParentComponent');

      // Re-registration of ComponentA does not have side effects
      app.component(ComponentA);
      expect(componentACreated).to.eql(1);
    });

    it('registers all providers from components', () => {
      class FooProvider {
        value() {
          return 'bar';
        }
      }

      class FooComponent {
        providers = {foo: FooProvider};
      }
      const app = new Application();
      app.component(FooComponent);
      const value = app.getSync('foo');
      expect(value).to.equal('bar');
    });

    it('registers all controllers from components', async () => {
      // TODO(bajtos) Beef up this test. Create a real controller with
      // a public API endpoint and verify that this endpoint can be invoked
      // via HTTP/REST API.

      class ProductController {}

      class ProductComponent {
        controllers: ControllerClass[] = [ProductController];
      }

      const app = new Application();
      app.component(ProductComponent);

      expect(app.find('controllers.*').map(b => b.key)).to.eql([
        'controllers.ProductController',
      ]);
    });

    it('allows parent context', async () => {
      class ProductController {}

      class ProductComponent {
        controllers: ControllerClass[] = [ProductController];
      }

      const parent = new Application();
      parent.component(ProductComponent);

      const app = new Application(parent);

      expect(app.find('controllers.*').map(b => b.key)).to.eql([
        'controllers.ProductController',
      ]);

      const app2 = new Application({}, parent);

      expect(app2.find('controllers.*').map(b => b.key)).to.eql([
        'controllers.ProductController',
      ]);

      const app3 = new Application();

      expect(app3.find('controllers.*').map(b => b.key)).to.not.containEql([
        'controllers.ProductController',
      ]);
    });

    it('injects component dependencies', () => {
      class ConfigComponent {
        providers = {
          greetBriefly: class HelloProvider {
            value() {
              return true;
            }
          },
        };
      }

      class BriefGreetingProvider {
        value() {
          return 'Hi!';
        }
      }

      class LongGreetingProvider {
        value() {
          return 'Hello!';
        }
      }

      class GreetingComponent {
        providers: {
          greeting: Constructor<Provider<string>>;
        };

        constructor(@inject('greetBriefly') greetBriefly: boolean) {
          this.providers = {
            greeting: greetBriefly
              ? BriefGreetingProvider
              : LongGreetingProvider,
          };
        }
      }
      const app = new Application();
      app.component(ConfigComponent);
      app.component(GreetingComponent);

      expect(app.getSync('greeting')).to.equal('Hi!');
    });
  });
});
