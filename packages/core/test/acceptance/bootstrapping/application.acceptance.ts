// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Constructor, Provider, inject} from '@loopback/context';
import {Application, Sequence} from '../../..';

describe('Bootstrapping the application', () => {
  context('with a user-defined sequence', () => {
    let app: Application;
    before(givenAppWithUserDefinedSequence);

    it('binds the `sequence` key to the user-defined sequence', async () => {
      const binding = await app.get('sequence');
      expect(binding.constructor.name).to.equal('UserDefinedSequence');
    });

    function givenAppWithUserDefinedSequence() {
      class UserDefinedSequence extends Sequence {}
      app = new Application({
        sequence: UserDefinedSequence,
      });
    }
  });

  context('with user-defined components', () => {
    it('binds all user-defined components to the application context', () => {
      class AuditComponent {}

      const app = new Application({components: [AuditComponent]});
      const componentKeys = app.find('component.*').map(b => b.key);
      expect(componentKeys).to.containEql('components.AuditComponent');

      const componentInstance = app.getSync('components.AuditComponent');
      expect(componentInstance).to.be.instanceOf(AuditComponent);
    });

    it('registers all providers from components', () => {
      class FooProvider {
        value() { return 'bar'; }
      }

      class FooComponent {
        providers = {foo: FooProvider};
      }

      const app = new Application({components: [FooComponent]});

      const value = app.getSync('foo');
      expect(value).to.equal('bar');
    });

    it('registers all controllers from components', () => {
      // TODO(bajtos) Beef up this test. Create a real controller with
      // a public API endpoint and verify that this endpoint can be invoked
      // via HTTP/REST API.

      class MyController {
      }

      class MyComponent {
        controllers = [MyController];
      }

      const app = new Application({components: [MyComponent]});

      expect(app.find('controllers.*').map(b => b.key))
        .to.eql(['controllers.MyController']);
    });

    it('injects component dependencies', () => {
      class ConfigComponent {
        providers = {
          greetBriefly: class HelloProvider {
            value() { return true; }
          },
        };
      }

      class BriefGreetingProvider {
        value() { return 'Hi!'; }
      }

      class LongGreetingProvider {
        value() { return 'Hello!'; }
      }

      class GreetingComponent {
        providers: {
          greeting: Constructor<Provider<string>>;
        };

        constructor(
          @inject('greetBriefly') greetBriefly: boolean,
        ) {
          this.providers = {
            greeting: greetBriefly ?
              BriefGreetingProvider :
              LongGreetingProvider,
          };
        }
      }

      const app = new Application({
        components: [ConfigComponent, GreetingComponent],
      });

      expect(app.getSync('greeting')).to.equal('Hi!');
    });
  });
});
