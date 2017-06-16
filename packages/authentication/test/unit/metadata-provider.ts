// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Provider} from '@loopback/context';
import {ParsedRequest, BindingKeys} from '@loopback/core';
import {
  AuthMetadataProvider,
  AuthenticationMetadata,
  authenticate,
} from '../..';

describe('AuthMetadataProvider', () => {
  let provider: Provider<AuthenticationMetadata | undefined>;

  class TestController {
    @authenticate('my-strategy', {option1: 'value1', option2: 'value2'})
    whoAmI() {}
  }

  class ControllerWithNoMetadata {
    whoAmI() {}
  }

  beforeEach(givenAuthMetadataProvider);

  describe('value()', () => {
    it('returns the authentication metadata of a controller method',
    async () => {
      const authMetadata:
        | AuthenticationMetadata
        | undefined = await provider.value();
      expect(authMetadata).to.be.eql({
        strategy: 'my-strategy',
        options: {option1: 'value1', option2: 'value2'},
      });
    });

    describe('context.get(provider_key)', () => {
      it('returns the authentication metadata of a controller method',
      async () => {
        const context: Context = new Context();
        context.bind(BindingKeys.Context.CONTROLLER_CLASS).to(TestController);
        context.bind(BindingKeys.Context.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .bind(BindingKeys.Context.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          BindingKeys.Context.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.eql({
          strategy: 'my-strategy',
          options: {option1: 'value1', option2: 'value2'},
        });
      });

      it('returns undefined if no authentication metadata is defined',
      async () => {
        const context: Context = new Context();
        context
          .bind(BindingKeys.Context.CONTROLLER_CLASS)
          .to(ControllerWithNoMetadata);
        context.bind(BindingKeys.Context.CONTROLLER_METHOD_NAME).to('whoAmI');
        context
          .bind(BindingKeys.Context.CONTROLLER_METHOD_META)
          .toProvider(AuthMetadataProvider);
        const authMetadata = await context.get(
          BindingKeys.Context.CONTROLLER_METHOD_META,
        );
        expect(authMetadata).to.be.undefined();
      });
    });
  });

  function givenAuthMetadataProvider() {
    provider = new AuthMetadataProvider(TestController, 'whoAmI');
  }
});
