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
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {verifyFunctionFactory} from '../authentication-strategies/types';

@bind.provider({scope: BindingScope.SINGLETON})
export class FacebookOauth implements Provider<FacebookStrategy> {
  strategy: FacebookStrategy;

  constructor(
    @inject('facebookOAuth2Options')
    public facebookOptions: StrategyOption,
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
  ) {
    this.strategy = new FacebookStrategy(
      this.facebookOptions,
      verifyFunctionFactory(this.userService),
    );
  }

  value() {
    return this.strategy;
  }
}
