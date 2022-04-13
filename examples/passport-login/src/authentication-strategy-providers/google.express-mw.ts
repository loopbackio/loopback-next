// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const passport = require('passport');
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {ExpressRequestHandler} from '@loopback/rest';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';

@injectable.provider({scope: BindingScope.SINGLETON})
export class GoogleOauth2ExpressMiddleware
  implements Provider<ExpressRequestHandler>
{
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
