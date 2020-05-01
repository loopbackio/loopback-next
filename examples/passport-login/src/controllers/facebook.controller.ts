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
import {SecurityBindings, UserProfile} from '@loopback/security';

/**
 * Login controller for facebook
 */
export class FacebookController {
  constructor(
  ) {}

  @intercept('PassportInitMW')
  @intercept('PassportSessionMW')
  @intercept('FacebookOauth2MW')
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

  @intercept('PassportInitMW')
  @intercept('PassportSessionMW')
  @intercept('FacebookOauth2MW')
  @get('/facebook/callback')
  /**
   * Endpoint: '/auth/facebook/callback'
   */
  async thirdPartyCallBack(
    @inject(SecurityBindings.USER) user: UserProfile,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const profile = {
      ...user.profile,
    };
    request.session.user = profile;
    response.redirect('/auth/account');
    return response;
  }
}
