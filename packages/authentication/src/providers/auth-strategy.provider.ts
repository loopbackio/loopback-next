// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, Getter, inject} from '@loopback/context';
import {
  extensionPoint,
  extensions,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {AuthenticationMetadata} from '../decorators/authenticate.decorator';
import {AuthenticationBindings} from '../keys';
import {
  AuthenticationStrategy,
  AuthenticationStrategyNotFoundError,
} from '../types';

//this needs to be transient, e.g. for request level context.
@extensionPoint(
  AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  {scope: BindingScope.TRANSIENT},
)
export class AuthenticationStrategyProvider
  implements Provider<AuthenticationStrategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @extensions()
    private authenticationStrategies: Getter<AuthenticationStrategy[]>,
  ) {}
  value(): ValueOrPromise<AuthenticationStrategy | undefined> {
    if (!this.metadata) {
      return;
    }
    const name = this.metadata.strategy;

    return this.findAuthenticationStrategy(name).then(function(strategy) {
      if (strategy) {
        return strategy;
      } else {
        // important not to throw a non-protocol-specific error here
        throw new AuthenticationStrategyNotFoundError(
          `The strategy '${name}' is not available.`,
        );
      }
    });
  }

  async findAuthenticationStrategy(name: string) {
    const strategies = await this.authenticationStrategies();
    const matchingAuthStrategy = strategies.find(a => a.name === name);
    return matchingAuthStrategy;
  }
}
