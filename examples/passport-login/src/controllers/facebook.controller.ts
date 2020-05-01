// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  get,
  RestBindings,
  Response,
  RequestWithSession,
} from '@loopback/rest';
import {inject, intercept} from '@loopback/core';
import {UserProfile} from '@loopback/security';

/**
 * Login controller for facebook
 */
export class FacebookController {
  constructor(
  ) {}

  @intercept('passport-init-mw', 'passport-session-mw', 'passport-facebook')
  @get('/auth/facebook')
  /**
   * Endpoint: '/auth/facebook'
   */
  loginToThirdParty(
    @inject('authentication.redirect.url')
    redirectUrl: string,
    @inject('authentication.redirect.status')
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  @intercept('passport-init-mw', 'passport-session-mw', 'passport-facebook')
  @get('/facebook/callback')
  /**
   * Endpoint: '/auth/facebook/callback'
   */
  async thirdPartyCallBack(
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    let user: any = request.user;
    const profile = {
      ...user,
    };
    request.session.user = profile;
    response.redirect('/auth/account');
    return response;
  }
}
