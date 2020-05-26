// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService, UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
import {User} from './models';
import {Credentials} from './services/user.service';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'myjwts3cr3t';
  export const TOKEN_EXPIRES_IN_VALUE = '21600';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
  export const DATASOURCE_NAME = 'jwtdb';
  export const USER_REPOSITORY = 'repositories.UserRepository';
  export const USER_CREDENTIALS_REPOSITORY =
    'repositories.UserCredentialsRepository';
}

export namespace RefreshTokenInterceptorConstants {
  export const REFRESH_INTERCEPTOR_NAME = 'refresh-token-generate';
  export const REFRESH_INTERCEPTOR_GRANT_TYPE = 'refresh-token-grant';
  export const REFRESH_SECRET_VALUE = 'r3fr35htok3n';
  export const REFRESH_EXPIRES_IN_VALUE = '216000';
  export const REFRESH_ISSURE_VALUE = 'loopback4';
}

export namespace RefreshTokenInterceptorBindings {
  export const REFRESH_SECRET = BindingKey.create<string>(
    'authentication.jwt.refresh.secret',
  );
  export const REFRESH_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.referesh.expires.in.seconds',
  );
  export const REFRESH_ISSURE = BindingKey.create<string>(
    'authentication.jwt.referesh.issure',
  );
}

export namespace RefreshTokenBindings {
  export const DATASOURCE_NAME = 'refreshdb';
  export const REFRESH_REPOSITORY = 'repositories.RefreshTokenRepository';
}

export type RefreshGrant = {
  refreshToken: string;
};

export const RefreshGrantSchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string',
    },
  },
};
export const RefreshGrantRequestBody = {
  description: 'Reissuing Acess Token',
  required: true,
  content: {
    'application/json': {schema: RefreshGrantSchema},
  },
};

export type TokenObject = {
  accessToken: string;
  expiresIn?: string | undefined;
  refreshToken?: string | undefined;
};
