// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {
  SessionAuth,
  FacebookOauthInterceptor,
  GoogleOauthInterceptor,
  CustomOauth2Interceptor,
} from '../authentication-interceptors';
import {
  FaceBookOauth2Authorization,
  GoogleOauth2Authorization,
  Oauth2AuthStrategy,
  LocalAuthStrategy,
  SessionStrategy,
  BasicStrategy,
} from '../authentication-strategies';
import {toInterceptor} from '@loopback/rest';
import passport from 'passport';

export function addPassportSerializers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.serializeUser(function (user: any, done) {
    done(null, user);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passport.deserializeUser(function (user: any, done) {
    done(null, user);
  });
}

export function bindPassportStrategies(app: Application) {
  // LoopBack 4 style authentication strategies
  app.add(createBindingFromClass(LocalAuthStrategy));
  app.add(createBindingFromClass(FaceBookOauth2Authorization));
  app.add(createBindingFromClass(GoogleOauth2Authorization));
  app.add(createBindingFromClass(Oauth2AuthStrategy));
  app.add(createBindingFromClass(SessionStrategy));
  app.add(createBindingFromClass(BasicStrategy));
}

export function bindPassportInterceptors(app: Application) {
  // Express style middleware interceptors
  app.bind('passport-init-mw').to(toInterceptor(passport.initialize()));
  app.bind('passport-session-mw').to(toInterceptor(passport.session()));
  app.bind('passport-facebook').toProvider(FacebookOauthInterceptor);
  app.bind('passport-google').toProvider(GoogleOauthInterceptor);
  app.bind('passport-oauth2').toProvider(CustomOauth2Interceptor);
  app.bind('set-session-user').toProvider(SessionAuth);
}
