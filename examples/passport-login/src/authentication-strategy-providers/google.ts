// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserIdentityService} from '@loopback/authentication';
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {Profile} from 'passport';
import {
  Strategy as GoogleStrategy,
  StrategyOptions,
} from 'passport-google-oauth2';
import {verifyFunctionFactory} from '../authentication-strategies/types';
import {User} from '../models';
import {UserServiceBindings} from '../services';

@injectable.provider({scope: BindingScope.SINGLETON})
export class GoogleOauth implements Provider<GoogleStrategy> {
  strategy: GoogleStrategy;

  constructor(
    @inject('googleOAuth2Options')
    public oauth2Options: StrategyOptions,
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
  ) {
    this.strategy = new GoogleStrategy(
      this.oauth2Options,
      verifyFunctionFactory(this.userService),
    );
  }

  value() {
    return this.strategy;
  }
}
