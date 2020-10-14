// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Constructor,
  createBindingFromClass,
  Provider,
} from '@loopback/core';
import {ExpressRequestHandler, toInterceptor} from '@loopback/rest';
import passport from 'passport';
import {
  CustomOauth2Interceptor,
  FacebookOauthInterceptor,
  GoogleOauthInterceptor,
  SessionAuth,
  TwitterOauthInterceptor,
} from './authentication-interceptors';
import {
  BasicStrategy,
  FaceBookOauth2Authentication,
  GoogleOauth2Authentication,
  LocalAuthStrategy,
  Oauth2AuthStrategy,
  SessionStrategy,
  TwitterOauthAuthentication,
} from './authentication-strategies';
import {
  CustomOauth2,
  CustomOauth2ExpressMiddleware,
  FacebookOauth,
  FacebookOauth2ExpressMiddleware,
  GoogleOauth,
  GoogleOauth2ExpressMiddleware,
  TwitterOauth,
  TwitterOauthExpressMiddleware,
} from './authentication-strategy-providers';
import {PassportUserIdentityService, UserServiceBindings} from './services';

export function setupBindings(app: Application) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.serializeUser(function (user: any, done) {
    done(null, user);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.deserializeUser(function (user: any, done) {
    done(null, user);
  });
  app
    .bind(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    .toClass(PassportUserIdentityService);

  // passport strategies
  const passportStrategies: Record<string, Constructor<unknown>> = {
    facebookStrategy: FacebookOauth,
    googleStrategy: GoogleOauth,
    twitterStrategy: TwitterOauth,
    oauth2Strategy: CustomOauth2,
  };
  for (const key in passportStrategies) {
    app.add(createBindingFromClass(passportStrategies[key], {key}));
  }

  // passport express middleware
  const middlewareMap: Record<
    string,
    Constructor<Provider<ExpressRequestHandler>>
  > = {
    facebookStrategyMiddleware: FacebookOauth2ExpressMiddleware,
    googleStrategyMiddleware: GoogleOauth2ExpressMiddleware,
    twitterStrategyMiddleware: TwitterOauthExpressMiddleware,
    oauth2StrategyMiddleware: CustomOauth2ExpressMiddleware,
  };
  for (const key in middlewareMap) {
    app.add(createBindingFromClass(middlewareMap[key], {key}));
  }

  // LoopBack 4 style authentication strategies
  const strategies: Constructor<unknown>[] = [
    LocalAuthStrategy,
    FaceBookOauth2Authentication,
    GoogleOauth2Authentication,
    TwitterOauthAuthentication,
    Oauth2AuthStrategy,
    SessionStrategy,
    BasicStrategy,
  ];
  for (const s of strategies) {
    app.add(createBindingFromClass(s));
  }

  // Express style middleware interceptors
  app.bind('passport-init-mw').to(toInterceptor(passport.initialize()));
  app.bind('passport-session-mw').to(toInterceptor(passport.session()));
  app.bind('passport-facebook').toProvider(FacebookOauthInterceptor);
  app.bind('passport-google').toProvider(GoogleOauthInterceptor);
  app.bind('passport-twitter').toProvider(TwitterOauthInterceptor);
  app.bind('passport-oauth2').toProvider(CustomOauth2Interceptor);
  app.bind('set-session-user').toProvider(SessionAuth);
}
