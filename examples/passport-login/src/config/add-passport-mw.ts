// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, createBindingFromClass} from '@loopback/core';
import {
  FacebookOauth,
  GoogleOauth,
  CustomOauth2,
  FacebookOauth2ExpressMiddleware,
  GoogleOauth2ExpressMiddleware,
  CustomOauth2ExpressMiddleware,
} from '../authentication-strategy-providers';
import {PassportUserIdentityService, UserServiceBindings} from '../services';

export function bindPassportMiddleware(app: Application) {
  app.bind(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE).toClass(
    PassportUserIdentityService,
  );
  // passport strategies
  app.add(createBindingFromClass(FacebookOauth, {key: 'facebookStrategy'}));
  app.add(createBindingFromClass(GoogleOauth, {key: 'googleStrategy'}));
  app.add(createBindingFromClass(CustomOauth2, {key: 'oauth2Strategy'}));
  // passport express middleware
  app.add(
    createBindingFromClass(FacebookOauth2ExpressMiddleware, {
      key: 'facebookStrategyMiddleware',
    }),
  );
  app.add(
    createBindingFromClass(GoogleOauth2ExpressMiddleware, {
      key: 'googleStrategyMiddleware',
    }),
  );
  app.add(
    createBindingFromClass(CustomOauth2ExpressMiddleware, {
      key: 'oauth2StrategyMiddleware',
    }),
  );
}
