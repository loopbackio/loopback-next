// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {registerAuthenticationStrategy} from '@loopback/authentication';
import {
  Application,
  Binding,
  Component,
  CoreBindings,
  createBindingFromClass,
  inject,
} from '@loopback/core';
import {
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
  RefreshTokenInterceptorConstants,
  RefreshTokenInterceptorBindings,
  RefreshTokenBindings,
} from './keys';
import {
  UserCredentialsRepository,
  UserRepository,
  RefreshTokenRepository,
} from './repositories';
import {MyUserService} from './services';
import {JWTAuthenticationStrategy} from './services/jwt.auth.strategy';
import {JWTService} from './services/jwt.service';
import {SecuritySpecEnhancer} from './services/security.spec.enhancer';
import {
  RefreshTokenGenerateInterceptor,
  RefreshTokenGrantInterceptor,
} from './interceptors';

export class JWTAuthenticationComponent implements Component {
  bindings: Binding[] = [
    // token bindings
    Binding.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService),

    // user bindings
    Binding.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService),
    Binding.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository),
    Binding.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(
      UserCredentialsRepository,
    ),
    createBindingFromClass(SecuritySpecEnhancer),
    ///refresh bindings
    Binding.bind(
      RefreshTokenInterceptorConstants.REFRESH_INTERCEPTOR_NAME,
    ).toProvider(RefreshTokenGenerateInterceptor),
    Binding.bind(
      RefreshTokenInterceptorConstants.REFRESH_INTERCEPTOR_GRANT_TYPE,
    ).toProvider(RefreshTokenGrantInterceptor),
    //  Refresh token bindings
    Binding.bind(RefreshTokenInterceptorBindings.REFRESH_SECRET).to(
      RefreshTokenInterceptorConstants.REFRESH_SECRET_VALUE,
    ),
    Binding.bind(RefreshTokenInterceptorBindings.REFRESH_EXPIRES_IN).to(
      RefreshTokenInterceptorConstants.REFRESH_EXPIRES_IN_VALUE,
    ),
    Binding.bind(RefreshTokenInterceptorBindings.REFRESH_ISSURE).to(
      RefreshTokenInterceptorConstants.REFRESH_ISSURE_VALUE,
    ),
    //refresh token repository binding
    Binding.bind(RefreshTokenBindings.REFRESH_REPOSITORY).toClass(
      RefreshTokenRepository,
    ),
  ];
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    registerAuthenticationStrategy(app, JWTAuthenticationStrategy);
  }
}
