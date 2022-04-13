// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const passport = require('passport');
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {ExpressRequestHandler} from '@loopback/rest';
import {Strategy as FacebookStrategy} from 'passport-facebook';

@injectable.provider({scope: BindingScope.SINGLETON})
export class FacebookOauth2ExpressMiddleware
  implements Provider<ExpressRequestHandler>
{
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
