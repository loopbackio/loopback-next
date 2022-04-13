// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const passport = require('passport');
import {BindingScope, inject, injectable, Provider} from '@loopback/core';
import {ExpressRequestHandler} from '@loopback/rest';
import {Strategy as TwitterStrategy} from 'passport-twitter';

@injectable.provider({scope: BindingScope.SINGLETON})
export class TwitterOauthExpressMiddleware
  implements Provider<ExpressRequestHandler>
{
  constructor(
    @inject('twitterStrategy')
    public twitterStrategy: TwitterStrategy,
  ) {
    passport.use(this.twitterStrategy);
  }

  value() {
    return passport.authenticate('twitter');
  }
}
