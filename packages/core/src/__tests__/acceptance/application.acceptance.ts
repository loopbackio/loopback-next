// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor, inject, Provider} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Application, ControllerClass} from '../..';

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
