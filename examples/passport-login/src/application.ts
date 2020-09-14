// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationComponent} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, toInterceptor} from '@loopback/rest';
import {CrudRestComponent} from '@loopback/rest-crud';
import {ServiceMixin} from '@loopback/service-proxy';
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
import {MySequence} from './sequence';
import {PassportUserIdentityService, UserServiceBindings} from './services';

export class OAuth2LoginApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();

    // Set up the custom sequence
    this.sequence(MySequence);

    this.component(AuthenticationComponent);
    this.component(CrudRestComponent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.serializeUser(function (user: any, done) {
      done(null, user);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passport.deserializeUser(function (user: any, done) {
      done(null, user);
    });

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    this.bind(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE).toClass(
      PassportUserIdentityService,
    );
    // passport strategies
    this.add(createBindingFromClass(FacebookOauth, {key: 'facebookStrategy'}));
    this.add(createBindingFromClass(GoogleOauth, {key: 'googleStrategy'}));
    this.add(createBindingFromClass(CustomOauth2, {key: 'oauth2Strategy'}));
    this.add(createBindingFromClass(TwitterOauth, {key: 'twitterStrategy'}));
    // passport express middleware
    this.add(
      createBindingFromClass(FacebookOauth2ExpressMiddleware, {
        key: 'facebookStrategyMiddleware',
      }),
    );
    this.add(
      createBindingFromClass(GoogleOauth2ExpressMiddleware, {
        key: 'googleStrategyMiddleware',
      }),
    );
    this.add(
      createBindingFromClass(TwitterOauthExpressMiddleware, {
        key: 'twitterStrategyMiddleware',
      }),
    );
    this.add(
      createBindingFromClass(CustomOauth2ExpressMiddleware, {
        key: 'oauth2StrategyMiddleware',
      }),
    );
    // LoopBack 4 style authentication strategies
    this.add(createBindingFromClass(LocalAuthStrategy));
    this.add(createBindingFromClass(FaceBookOauth2Authentication));
    this.add(createBindingFromClass(GoogleOauth2Authentication));
    this.add(createBindingFromClass(TwitterOauthAuthentication));
    this.add(createBindingFromClass(Oauth2AuthStrategy));
    this.add(createBindingFromClass(SessionStrategy));
    this.add(createBindingFromClass(BasicStrategy));
    // Express style middleware interceptors
    this.bind('passport-init-mw').to(toInterceptor(passport.initialize()));
    this.bind('passport-session-mw').to(toInterceptor(passport.session()));
    this.bind('passport-facebook').toProvider(FacebookOauthInterceptor);
    this.bind('passport-google').toProvider(GoogleOauthInterceptor);
    this.bind('passport-twitter').toProvider(TwitterOauthInterceptor);
    this.bind('passport-oauth2').toProvider(CustomOauth2Interceptor);
    this.bind('set-session-user').toProvider(SessionAuth);
  }
}
