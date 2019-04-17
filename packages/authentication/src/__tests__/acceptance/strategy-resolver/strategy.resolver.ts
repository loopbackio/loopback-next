// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {Provider, ValueOrPromise} from '@loopback/core';
import {AuthenticationMetadata} from '../../../decorators/authenticate.decorator';
import {
  extensionPoint,
  extensions,
} from '../../../decorators/authentication-extension.decorators';
import {AuthenticationBindings} from '../../../keys';
import {AuthenticationStrategy} from '../../../types';

@extensionPoint('authentication-strategy')
export class StrategyResolverProvider
  implements Provider<AuthenticationStrategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @extensions() // Sugar for @inject.getter(filterByTag({extensionPoint: 'greeter'}))
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
        throw new Error(`The strategy '${name}' is not available.`);
      }
    });
  }

  async findAuthenticationStrategy(name: string) {
    const strategies = await this.authenticationStrategies();
    const matchingAuthStrategy = strategies.find(a => a.name === name);
    return matchingAuthStrategy;
  }
}
