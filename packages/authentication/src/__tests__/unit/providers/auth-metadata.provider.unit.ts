// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, Provider} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {authenticate, AuthenticationMetadata} from '../../..';
import {AuthenticationBindings} from '../../../keys';
import {AuthMetadataProvider} from '../../../providers';

describe('AuthMetadataProvider', () => {
  let provider: Provider<AuthenticationMetadata | undefined>;

  class TestController {
    @authenticate('my-strategy', {option1: 'value1', option2: 'value2'})
    whoAmI() {}

    @authenticate.skip()
    hello() {}
  }

  class ControllerWithNoMetadata {
    whoAmI() {}
  }

  beforeEach(givenAuthMetadataProvider);

  describe('value()', () => {
    it('returns the auth metadata of a controller method', async () => {
      const authMetadata:
        | AuthenticationMetadata
        | undefined = await provider.value();
      expect(authMetadata).to.be.eql({
        strategy: 'my-strategy',
        options: {option1: 'value1', option2: 'value2'},
      });
    });

    describe('context.get(provider_key)', () => {
      it('returns the auth metadata of a controller method', async () => {
        const context: Context = new Context();
        context.bind(CoreBindings.CONTROLLER_CLASS).to(TestController);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.eql({
          strategy: 'my-strategy',
          options: {option1: 'value1', option2: 'value2'},
        });
      });

      it('returns undefined for a method decorated with @authenticate.skip', async () => {
        const context: Context = new Context();
        context.bind(CoreBindings.CONTROLLER_CLASS).to(TestController);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('hello');
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.undefined();
      });

      it('returns undefined for a method decorated with @authenticate.skip even with default metadata', async () => {
        const context: Context = new Context();
        context.bind(CoreBindings.CONTROLLER_CLASS).to(TestController);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('hello');
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        context
          .configure(AuthenticationBindings.COMPONENT)
          .to({defaultMetadata: {strategy: 'xyz'}});
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.undefined();
      });

      it('returns undefined if no auth metadata is defined', async () => {
        const context: Context = new Context();
        context
          .bind(CoreBindings.CONTROLLER_CLASS)
          .to(ControllerWithNoMetadata);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.undefined();
      });

      it('returns default metadata if no auth metadata is defined', async () => {
        const context: Context = new Context();
        context
          .bind(CoreBindings.CONTROLLER_CLASS)
          .to(ControllerWithNoMetadata);
        context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .configure(AuthenticationBindings.COMPONENT)
          .to({defaultMetadata: {strategy: 'xyz'}});
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.eql({strategy: 'xyz'});
      });

      it('returns undefined when the class or method is missing', async () => {
        const context: Context = new Context();
        context
          .bind(CoreBindings.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          CoreBindings.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.undefined();
      });
    });
  });

  function givenAuthMetadataProvider() {
    provider = new AuthMetadataProvider(TestController, 'whoAmI');
  }
});
