// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, Provider, Setter, inject} from '@loopback/context';
import {Request} from '@loopback/rest';
import {AuthenticationBindings} from '../keys';
import {ActionType, AuthenticationMetadata} from '../types';
import {Model} from '@loopback/repository';
import {AuthStrategy} from '../strategies';

/**
 * @description Provider of a function which authenticates
 * @example `context.bind('authentication_key')
 *   .toProvider(AuthenticateActionProvider)`
 */
export class AuthenticateActionProvider<U extends Model>
  implements Provider<Function> {
  constructor(
    // The provider is instantiated for Sequence constructor,
    // at which time we don't have information about the current
    // route yet. This information is needed to determine
    // what auth strategy should be used.
    // To solve this, we are injecting a getter function that will
    // defer resolution of the strategy until authenticate() action
    // is executed.
    @inject.getter(AuthenticationBindings.STRATEGY_RESOLVER)
    readonly getStrategy: Getter<AuthStrategy<U>>,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    // what if the user is not set in the action
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    readonly setCurrentUser: Setter<U>,
  ) {}

  /**
   * @returns authenticateFn
   */
  value(): Function {
    const actionName = this.getActionName();

    // A workaround for
    // return (request: Request) => this[actionName].call(request)
    // got error for ^ and solving it.
    switch (actionName) {
      case 'verify':
        return (request: Request) => this.verify(request);
      case 'login':
        return (request: Request) => this.login(request);
      case 'register':
        return (request: Request) => this.register(request);
      default:
        // tslint:disable-next-line:no-unused
        return (request: Request) => {
          return;
        };
    }
  }

  /**
   * Get the name of authentication action to perform from
   * an endpoint's metadata
   */
  getActionName(): ActionType | undefined {
    if (!this.metadata || !this.metadata.action) {
      return;
    }
    return this.metadata.action;
  }

  /**
   * The implementation of authenticate() sequence action(verify).
   * @param request The incoming request provided by the REST layer
   */
  async verify(request: Request): Promise<U | undefined> {
    const strategy = await this.getStrategy();
    if (!strategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }
    if (!strategy.verify) {
      throw new Error('invalid strategy parameter');
    }

    const user = await strategy.verify(request);

    if (user) this.setCurrentUser(user);
    return user;
  }

  /**
   * The implementation of authenticate() sequence action(login).
   * @param request The incoming request provided by the REST layer
   */
  async login(request: Request): Promise<U | undefined> {
    const strategy = await this.getStrategy();
    if (!strategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }
    if (!strategy.login) {
      throw new Error('invalid strategy parameter');
    }

    return await strategy.login(request);
  }

  /**
   * The implementation of authenticate() sequence action(register).
   * @param request The incoming request provided by the REST layer
   */
  async register(request: Request): Promise<U | undefined> {
    const strategy = await this.getStrategy();
    if (!strategy) {
      // The invoked operation does not require authentication.
      return undefined;
    }
    if (!strategy.register) {
      throw new Error('invalid strategy parameter');
    }

    return await strategy.register(request);
  }
}
