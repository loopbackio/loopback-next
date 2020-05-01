// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationStrategy, asAuthStrategy} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {Strategy} from 'passport-oauth2';
import {Request, RedirectRoute} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {User} from '../models';
import {inject, bind, extensions, Getter} from '@loopback/core';
import {PassportAuthenticationBindings, mapProfile} from './types';

@bind(asAuthStrategy)
export class Oauth2AuthStrategy implements AuthenticationStrategy {
  name = 'oauth2';
  protected strategy: StrategyAdapter<User>;

  /**
   * create an oauth2 strategy
   */
  constructor(
    /**
     * enable extensions for provider specific oauth2 implementations
     * reroute to the specific extension based on given provider name
     */
    @extensions(PassportAuthenticationBindings.OAUTH2_STRATEGY)
    private getStrategies: Getter<Oauth2AuthStrategy[]>,
    @inject('oauth2Strategy')
    public passportstrategy: Strategy,
  ) {
    this.strategy = new StrategyAdapter(
      this.passportstrategy,
      this.name,
      mapProfile.bind(this),
    );
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    if (
      request.query['oauth2-provider-name'] &&
      request.query['oauth2-provider-name'] !== 'oauth2'
    ) {
      /**
       * if provider name is given then reroute to the provider extension
       */
      const providerName = request.query['oauth2-provider-name'];
      const strategies: Oauth2AuthStrategy[] = await this.getStrategies();
      const strategy = strategies.find(
        (s: Oauth2AuthStrategy) => s.name === 'oauth2-' + providerName,
      );
      if (!strategy) throw new Error('provider not found');
      return strategy.authenticate(request);
    } else {
      /**
       * provider not given, use passport-oauth2 for custom provider implementation
       */
      return this.strategy.authenticate(request);
    }
  }
}
