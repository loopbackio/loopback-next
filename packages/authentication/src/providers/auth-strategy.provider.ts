// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  extensionPoint,
  extensions,
  Getter,
  inject,
  Provider,
} from '@loopback/core';
import {AuthenticationBindings} from '../keys';
import {
  AuthenticationMetadata,
  AuthenticationStrategy,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
} from '../types';

/**
 * An authentication strategy provider responsible for
 * resolving an authentication strategy by name.
 *
 * It declares an extension point to which all authentication strategy
 * implementations must register themselves as extensions.
 *
 * @example `context.bind('authentication.strategy').toProvider(AuthenticationStrategyProvider)`
 */
@extensionPoint(
  AuthenticationBindings.AUTHENTICATION_STRATEGY_EXTENSION_POINT_NAME,
  {scope: BindingScope.TRANSIENT},
) //this needs to be transient, e.g. for request level context.
export class AuthenticationStrategyProvider
  implements Provider<AuthenticationStrategy[] | undefined> {
  constructor(
    @extensions()
    protected authenticationStrategies: Getter<AuthenticationStrategy[]>,
    @inject(AuthenticationBindings.METADATA)
    protected metadata?: AuthenticationMetadata[],
  ) {}
  async value(): Promise<AuthenticationStrategy[] | undefined> {
    if (!this.metadata?.length) {
      return undefined;
    }
    return this.findAuthenticationStrategies(this.metadata);
  }

  private async findAuthenticationStrategies(
    metadata: AuthenticationMetadata[],
  ): Promise<AuthenticationStrategy[]> {
    const strategies: AuthenticationStrategy[] = [];

    const existingStrategies = await this.authenticationStrategies();

    const findStrategy = (name: string) => {
      const strategy = existingStrategies.find(a => a.name === name);
      if (!strategy) {
        const error = new Error(`The strategy '${name}' is not available.`);
        Object.assign(error, {
          code: AUTHENTICATION_STRATEGY_NOT_FOUND,
        });
        throw error;
      }
      return strategy;
    };

    for (const data of metadata) {
      const strategy = findStrategy(data.strategy);
      strategies.push(strategy);
    }

    return strategies;
  }
}
