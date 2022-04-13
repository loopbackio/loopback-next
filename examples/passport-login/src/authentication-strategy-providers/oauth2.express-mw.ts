// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const passport = require('passport');
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {ExpressRequestHandler} from '@loopback/rest';
import {Strategy as OAuth2Strategy} from 'passport-oauth2';

@injectable.provider({scope: BindingScope.SINGLETON})
export class CustomOauth2ExpressMiddleware
  implements Provider<ExpressRequestHandler>
{
  constructor(
    @inject('oauth2Strategy')
    public oauth2Strategy: OAuth2Strategy,
  ) {
    passport.use(this.oauth2Strategy);
  }

  value() {
    return passport.authenticate('oauth2');
  }
}
