// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asAuthStrategy,
  AuthenticationStrategy,
  UserIdentityService,
} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {Profile} from 'passport';
import {Strategy, StrategyOption} from 'passport-facebook';
import {bind, inject} from '@loopback/context';
import {UserServiceBindings} from '../services';
import {extensionFor} from '@loopback/core';
import {UserProfile} from '@loopback/security';
import {User} from '../models';
import {Request, RedirectRoute} from '@loopback/rest';
import {PassportAuthenticationBindings} from './types';
import {verifyFunctionFactory, mapProfile} from './types';

@bind(
  asAuthStrategy,
  extensionFor(PassportAuthenticationBindings.OAUTH2_STRATEGY),
)
export class FaceBookOauth2Authorization implements AuthenticationStrategy {
  name = 'oauth2-facebook';
  protected strategy: StrategyAdapter<User>;
  passportstrategy: Strategy;

  /**
   * create an oauth2 strategy for facebook
   */
  constructor(
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
    @inject('facebookOAuth2Options')
    public facebookOptions: StrategyOption,
  ) {
    this.passportstrategy = new Strategy(
      facebookOptions,
      verifyFunctionFactory(userService).bind(this),
    );
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
    return this.strategy.authenticate(request);
  }
}
