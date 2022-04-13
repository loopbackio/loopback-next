// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserIdentityService} from '@loopback/authentication';
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {Profile} from 'passport';
import {IStrategyOption, Strategy as TwitterStrategy} from 'passport-twitter';
import {verifyFunctionFactory} from '../authentication-strategies/types';
import {User} from '../models';
import {UserServiceBindings} from '../services';

@injectable.provider({scope: BindingScope.SINGLETON})
export class TwitterOauth implements Provider<TwitterStrategy> {
  strategy: TwitterStrategy;

  constructor(
    @inject('twitterOAuthOptions')
    public oauthOptions: IStrategyOption,
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
  ) {
    this.strategy = new TwitterStrategy(
      this.oauthOptions,
      verifyFunctionFactory(this.userService),
    );
  }

  value() {
    return this.strategy;
  }
}
