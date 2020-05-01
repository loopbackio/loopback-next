// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Profile} from 'passport';
import {UserIdentityService} from '@loopback/authentication';
import {User} from '../models';
import {StrategyOption} from 'passport-facebook';
import {inject, Provider, bind, BindingScope} from '@loopback/core';
import {UserServiceBindings} from '../services';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';
import {verifyFunctionFactory} from '../authentication-strategies/types';

@bind.provider({scope: BindingScope.SINGLETON})
export class GoogleOauth implements Provider<GoogleStrategy> {
  strategy: GoogleStrategy;

  constructor(
    @inject('googleOAuth2Options')
    public oauth2Options: StrategyOption,
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
