// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const passport = require('passport');
import {inject, Provider, bind, BindingScope} from '@loopback/core';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';
import {ExpressRequestHandler} from '@loopback/rest';

@bind.provider({scope: BindingScope.SINGLETON})
export class GoogleOauth2ExpressMiddleware
  implements Provider<ExpressRequestHandler> {
  constructor(
    @inject('googleStrategy')
    public strategy: GoogleStrategy,
  ) {
    passport.use(this.strategy);
  }

  value() {
    return passport.authenticate('google');
  }
}
