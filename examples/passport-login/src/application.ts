// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {MySequence} from './sequence';
import {AuthenticationComponent} from '@loopback/authentication';
import {
  FaceBookOauth2Authorization,
  GoogleOauth2Authorization,
  Oauth2AuthStrategy,
  LocalAuthStrategy,
  SessionStrategy,
  BasicStrategy,
  FacebookOauth2MW,
  PassportInitMW,
  PassportSessionMW,
} from './authentication-strategies';
import {PassportUserIdentityService, UserServiceBindings} from './services';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {CrudRestComponent} from '@loopback/rest-crud';
import {createMiddlewareInterceptorBinding} from '@loopback/rest';

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

    this.add(createMiddlewareInterceptorBinding(PassportInitMW));
    this.add(createMiddlewareInterceptorBinding(PassportSessionMW));
    this.add(createMiddlewareInterceptorBinding(FacebookOauth2MW));

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
    this.add(createBindingFromClass(LocalAuthStrategy));
    this.add(createBindingFromClass(FaceBookOauth2Authorization));
    this.add(createBindingFromClass(GoogleOauth2Authorization));
    this.add(createBindingFromClass(Oauth2AuthStrategy));
    this.add(createBindingFromClass(SessionStrategy));
    this.add(createBindingFromClass(BasicStrategy));
  }
}
