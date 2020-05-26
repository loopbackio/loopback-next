// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {composeInterceptors, intercept} from '@loopback/core';

/**
 *  Name: OAuth2InterceptExpressMiddleware
 *  Type: DECORATOR
 *
 *  This method uses the @intercept decorator to intercept incoming requests with a series of passport strategies.
 *  It composes an middleware interceptor chain with the following interceptor keys:
 *      'passport-init-mw',
 *      'passport-session-mw',
 *      'passport-facebook',
 *      'passport-google',
 *      'passport-oauth2'
 */
export function oAuth2InterceptExpressMiddleware() {
  return intercept(
    composeInterceptors(
      'passport-init-mw',
      'passport-session-mw',
      'passport-facebook',
      'passport-oauth2',
      'passport-google',
      'set-session-user',
    ),
  );
}
