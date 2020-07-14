// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate, UserProfileFactory} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  MockTestOauth2SocialApp,
  MyUser,
  userRepository,
} from '@loopback/mock-oauth2-provider';
import {get, Response, RestApplication, RestBindings} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {
  Client,
  createClientForHandler,
  expect,
  supertest,
} from '@loopback/testlab';
import axios from 'axios';
import {AddressInfo} from 'net';
import {
  Strategy as Oauth2Strategy,
  StrategyOptions,
  VerifyCallback,
  VerifyFunction,
} from 'passport-oauth2';
import qs from 'qs';
import * as url from 'url';
import {StrategyAdapter} from '../../strategy-adapter';
import {
  configureApplication,
  simpleRestApplication,
} from './fixtures/simple-rest-app';

/**
 * This test consists of three main components -> the supertest client, the LoopBack app (simple-rest-app.ts)
 * and the Mock Authorization Server (mock-oauth2-social-app.ts)
 *
 *  PLEASE LOOK AT fixtures/README.md file before going thru the below
 *
 *  Mock Authorization Server (mock-oauth2-social-app.ts) :
 *           mocks the authorization flow login with a social app like facebook, google, etc
 *  LoopBack app (simple-rest-app.ts) :
 *           has a simple app with no controller, Oauth2Controller is added in this test
 */

/**
 * options to pass to the Passport Strategy
 */
const oauth2Options: StrategyOptions = {
  clientID: '1111',
  clientSecret: '1917e2b73a87fd0c9a92afab64f6c8d4',
  // `redirect_uri`:
  // 'passport-oauth2' takes care of sending the configured `callBackURL` setting as `redirect_uri`
  // to the authorization server. This behaviour is inherited by all other oauth2 modules like facebook, google, etc
  callbackURL: 'http://localhost:8080/auth/thirdparty/callback',
  // 'authorizationURL' is used by 'passport-oauth2' to begin the authorization grant flow
  authorizationURL: 'http://localhost:9000/oauth/dialog',
  // `tokenURL` is used by 'passport-oauth2' to exchange the access code for an access token
  // this exchange is taken care internally by 'passport-oauth2'
  // when the `callbackURL` is invoked by the authorization server
  tokenURL: 'http://localhost:9000/oauth/token',
};

/**
 * verify function for the oauth2 strategy
 * This function mocks a lookup against a user profile datastore
 *
 * @param accessToken
 * @param refreshToken
 * @param profile
 * @param done
 */
const verify: VerifyFunction = function (
  accessToken: string,
  refreshToken: string,
  userProfile: MyUser,
  done: VerifyCallback,
) {
  userProfile.token = accessToken;
  if (!userRepository.findById(userProfile.id)) {
    userRepository.createExternalUser(userProfile);
  }
  return done(null, userProfile);
};

/**
 * convert user info to user profile
 * @param user
 */
const myUserProfileFactory: UserProfileFactory<MyUser> = function (
  user: MyUser,
): UserProfile {
  const userProfile = {[securityId]: user.id, ...user};
  return userProfile;
};

/**
 * Login controller for third party oauth provider
 *
 * This creates an authentication endpoint for the third party oauth provider
 *
 * Two methods are expected
 *
 * 1. loginToThirdParty
 *           i. an endpoint for api clients to login via a third party app
 *          ii. the passport strategy identifies this call as a redirection to third party
 *         iii. this endpoint redirects to the third party authorization url
 *
 * 2. thirdPartyCallBack
 *           i. this is the callback for the thirdparty app
 *          ii. on successful user login the third party calls this endpoint with an access code
 *         iii. the passport oauth2 strategy exchanges the code for an access token
 *          iv. the passport oauth2 strategy then calls the provided `verify()` function with the access token
 */
export class Oauth2Controller {
  constructor() {}

  // this configures the oauth2 strategy
  @authenticate('oauth2')
  // we have modeled this as a GET endpoint
  @get('/auth/thirdparty')
  // loginToThirdParty() is the handler for '/auth/thirdparty'
  // this method is injected with redirect url and status
  // the value for 'authentication.redirect.url' is set by the authentication action provider
  loginToThirdParty(
    @inject('authentication.redirect.url')
    redirectUrl: string,
    @inject('authentication.redirect.status')
    status: number,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ) {
    // controller handles redirect
    // and returns response object to indicate response is already handled
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  // we configure the callback url also with the same oauth2 strategy
  @authenticate('oauth2')
  // this SHOULD be a GET call so that the third party can ask the browser to redirect
  @get('/auth/thirdparty/callback')
  // thirdPartyCallBack() is the handler for '/auth/thirdparty/callback'
  // the oauth2 strategy identifies this as a callback with the request.query.code sent by the third party app
  // the oauth2 strategy exchanges the access code for a access token and then calls the provided verify() function
  // the verify function creates a user profile after verifying the access token
  thirdPartyCallBack(@inject(SecurityBindings.USER) user: UserProfile) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {access_token: user.token};
  }
}

describe('Oauth2 authorization flow', () => {
  let app: RestApplication;
  let oauth2Strategy: StrategyAdapter<MyUser>;
  let client: Client;
  let oauth2Client: Client;

  before(() => {
    const server = MockTestOauth2SocialApp.startMock();
    const port = (server.address() as AddressInfo).port;
    oauth2Client = supertest(`http://localhost:${port}`);
  });
  after(MockTestOauth2SocialApp.stopMock);

  before(givenLoopBackApp);
  before(givenOauth2Strategy);
  before(setupAuthentication);
  before(givenControllerInApp);
  before(givenClient);

  let oauthProviderUrl: string;
  let providerLoginUrl: string;
  let callbackToLbApp: string;
  let loginPageParams: string;

  context('Stage 1 - Authorization code grant', () => {
    describe('when client invokes oauth flow', () => {
      it('call is redirected to third party authorization url', async () => {
        // HTTP status code 303 means see other,
        // on seeing which the browser would redirect to the other location
        const response = await client.get('/auth/thirdparty').expect(303);
        oauthProviderUrl = response.get('Location');
        expect(url.parse(response.get('Location')).pathname).to.equal(
          url.parse(oauth2Options.authorizationURL).pathname,
        );
      });

      it('call to authorization url is redirected to oauth providers login page', async () => {
        // HTTP status code 302 means redirect to new uri,
        // on seeing which the browser would redirect to the new uri
        const response = await supertest('').get(oauthProviderUrl).expect(302);
        providerLoginUrl = response.get('Location');
        loginPageParams = url.parse(providerLoginUrl).query ?? '';
        expect(url.parse(response.get('Location')).pathname).to.equal('/login');
      });

      it('login page redirects to authorization app callback endpoint', async () => {
        const loginPageHiddenParams = qs.parse(loginPageParams);
        const params = {
          username: 'user1',
          password: 'abc',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: loginPageHiddenParams.client_id,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uri: loginPageHiddenParams.redirect_uri,
          scope: loginPageHiddenParams.scope,
        };
        // On successful login, the authorizing app redirects to the callback url
        // HTTP status code 302 is returned to the browser
        const response = await oauth2Client
          .post('/login_submit')
          .send(qs.stringify(params))
          .expect(302);
        callbackToLbApp = response.get('Location');
        expect(url.parse(callbackToLbApp).pathname).to.equal(
          '/auth/thirdparty/callback',
        );
      });

      it('callback url contains access code', async () => {
        expect(url.parse(callbackToLbApp).query).to.containEql('code');
      });
    });
  });

  context('Stage 2: Authentication', () => {
    describe('Invoking call back url returns access token', () => {
      it('access code can be exchanged for token', async () => {
        expect(url.parse(callbackToLbApp).path).to.containEql(
          '/auth/thirdparty/callback',
        );
        const path: string = url.parse(callbackToLbApp).path ?? '';
        const response = await client.get(path).expect(200);
        expect(response.body).property('access_token');
      });
    });
  });

  function givenLoopBackApp() {
    app = simpleRestApplication();
  }

  function givenOauth2Strategy() {
    const passport = new Oauth2Strategy(oauth2Options, verify);

    // passport-oauth2 base class leaves user profile creation to subclass implementations
    passport.userProfile = (accessToken, done) => {
      // call the profile url in the mock authorization app with the accessToken
      axios
        .get('http://localhost:9000/verify?access_token=' + accessToken, {
          headers: {Authorization: accessToken},
        })
        .then(response => {
          done(null, response.data);
        })
        .catch(err => {
          done(err);
        });
    };

    // use strategy adapter to fit passport strategy to LoopBack app
    oauth2Strategy = new StrategyAdapter(
      passport,
      'oauth2',
      myUserProfileFactory,
    );
  }

  async function setupAuthentication() {
    await configureApplication(oauth2Strategy, 'oauth2');
  }

  function givenControllerInApp() {
    return app.controller(Oauth2Controller);
  }

  function givenClient() {
    client = createClientForHandler(app.requestHandler);
  }
});
