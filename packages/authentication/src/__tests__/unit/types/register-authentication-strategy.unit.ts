// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {
  AuthenticationBindings,
  AuthenticationStrategy,
  registerAuthenticationStrategy,
} from '../../..';

describe('registerAuthenticationStrategy', () => {
  let ctx: Context;

  beforeEach(givenContext);

  it('adds a binding for the strategy', () => {
    const binding = registerAuthenticationStrategy(
      ctx,
      MyAuthenticationStrategy,
    );
    expect(binding.tagMap).to.containEql({
      extensionFor:
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
    });
    expect(binding.key).to.eql(
      `${AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME}.MyAuthenticationStrategy`,
    );
  });

  class MyAuthenticationStrategy implements AuthenticationStrategy {
    name: 'my-auth';
    async authenticate(request: Request): Promise<UserProfile | undefined> {
      return {
        [securityId]: 'somebody',
      };
    }
  }

  function givenContext() {
    ctx = new Context('app');
  }
});
