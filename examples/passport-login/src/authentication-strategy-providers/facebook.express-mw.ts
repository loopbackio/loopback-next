// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const passport = require('passport');
import {inject, Provider, bind, BindingScope} from '@loopback/core';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {ExpressRequestHandler} from '@loopback/rest';

@bind.provider({scope: BindingScope.SINGLETON})
export class FacebookOauth2ExpressMiddleware
  implements Provider<ExpressRequestHandler> {
  constructor(
    @inject('facebookStrategy')
    public facebookStrategy: FacebookStrategy,
  ) {
    passport.use(this.facebookStrategy);
  }

  value() {
    return passport.authenticate('facebook');
  }
}
