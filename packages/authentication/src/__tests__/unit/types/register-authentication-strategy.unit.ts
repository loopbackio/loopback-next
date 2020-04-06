// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Context, createBindingFromClass} from '@loopback/context';
import {
  asSpecEnhancer,
  OASEnhancer,
  OASEnhancerBindings,
  OpenApiSpec,
} from '@loopback/openapi-v3';
import {Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {
  asAuthStrategy,
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
      extensionFor: [
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
        OASEnhancerBindings.OAS_ENHANCER_EXTENSION_POINT_NAME,
      ],
    });
    expect(binding.key).to.eql(
      `${AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME}.MyAuthenticationStrategy`,
    );
  });

  it('adds a binding for the strategy and security spec', () => {
    const binding = createBindingFromClass(MyAuthenticationStrategy);
    expect(binding.tagMap).to.containEql({
      extensionFor: [
        AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
        OASEnhancerBindings.OAS_ENHANCER_EXTENSION_POINT_NAME,
      ],
    });
    expect(binding.key).to.eql(
      `${OASEnhancerBindings.OAS_ENHANCER_EXTENSION_POINT_NAME}.MyAuthenticationStrategy`,
    );
  });

  @bind(asAuthStrategy, asSpecEnhancer)
  class MyAuthenticationStrategy
    implements AuthenticationStrategy, OASEnhancer {
    name: 'my-auth';
    async authenticate(request: Request): Promise<UserProfile | undefined> {
      return {
        [securityId]: 'somebody',
      };
    }
    modifySpec(spec: OpenApiSpec): OpenApiSpec {
      return {
        openapi: '3.0.0',
        info: {title: 'Test', version: '1.0.0'},
        paths: {},
      };
    }
  }

  function givenContext() {
    ctx = new Context('app');
  }
});
