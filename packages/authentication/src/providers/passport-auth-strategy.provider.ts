// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, Getter, inject} from '@loopback/context';
import {extensionPoint, extensions, Provider} from '@loopback/core';
import {Strategy} from 'passport';
import {AuthenticationMetadata} from '../decorators/authenticate.decorator';
import {AuthenticationBindings} from '../keys';
import {StrategyAdapter} from '../strategy-adapter';
import {AuthenticationStrategy} from '../types';

//this needs to be transient, e.g. for request level context.
@extensionPoint(AuthenticationBindings.PASSPORT_STRATEGY_EXTENSION_POINT_NAME, {
  scope: BindingScope.TRANSIENT,
})
export class PassportStrategyProvider
  implements Provider<AuthenticationStrategy | undefined> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @extensions()
    private passportStrategies: Getter<Strategy[]>,
  ) {}
  async value(): Promise<AuthenticationStrategy | undefined> {
    if (!this.metadata) {
      return undefined;
    }
    const name = this.metadata.strategy;
    const strategy = await this.findAuthenticationStrategy(name);
    if (!strategy) return;
    return new StrategyAdapter(strategy, name);
  }

  async findAuthenticationStrategy(name: string) {
    const strategies = await this.passportStrategies();
    const matchingAuthStrategy = strategies.find(a => a.name === name);
    return matchingAuthStrategy;
  }
}
