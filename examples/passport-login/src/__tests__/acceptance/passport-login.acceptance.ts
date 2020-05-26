// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MockTestOauth2SocialApp} from '@loopback/mock-oauth2-provider';
import {Client, expect, supertest} from '@loopback/testlab';
import * as path from 'path';
import qs from 'qs';
import * as url from 'url';
import {startApplication} from '../../';
import {User, UserIdentity} from '../../models';
import {ExpressServer} from '../../server';
const oauth2Providers = require(path.resolve(
  __dirname,
  '../../../data/oauth2-test-provider',
));

/**
 * Scenarios to test:
 *    Scenario 1: Signing up as a NEW user
 *         User is able to create a local user profile by signing in with
 *         an email-id and password, if the email id is not registered already.
 *
 *    Scenario 2: Link an external profile with a local user
 *         After the user signs up, user is able to link local account with an
 *         external profile in a social app, if the email id is same.
 *
 *    Scenario 3: Sign Up (create a new user) via an external profile
 *         When a user attempts to sign up with an external profile, and the email-id
 *         in the profile is not registered locally, a new local account is created
 */
describe('example-passport-login acceptance test', () => {
  let server: ExpressServer;
  let client: Client;

  /**
   * This test uses the mock social app from the @loopback/authentication-passport package,
   * as oauth2 profile endpoint.
   */
  before(() => MockTestOauth2SocialApp.startMock());
  after(MockTestOauth2SocialApp.stopMock);
  before(async function setupApplication(this: Mocha.Context) {
    this.timeout(6000);
    server = await startApplication(oauth2Providers);
    client = supertest(server.webApp);
  });

  before(async function clearTestData() {
    await client
      .delete('/api/clear')
      .auth('admin', 'password', {type: 'basic'});
  });

  after(async function clearTestData() {
    await client
      .delete('/api/clear')
      .auth('admin', 'password', {type: 'basic'});
  });

  after(async function closeApplication() {
    await server.stop();
  });

  describe('User login scenarios', () => {
    let Cookie: string;

    /**
     ***************************************
     *  Scenario 1: Signing up as a NEW user
     ***************************************
     *    Test case 1: sign up as a new user locally, provide email id and password
     *    Test case 2: login as the new user with email id
     *    Test case 3: logout
     */
    context('Scenario 1: Signing up as a NEW user', () => {
      /**
       * create a local account in the loopback app with the following profile
       *     username: test@example.com
       *     email: test@example.com
       */
      it('signup as new user with loopback app', async () => {
        const response: supertest.Response = await client
          .post('/users/signup')
          .type('form')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            username: 'test@example.com',
            password: 'password',
          })
          .expect(302);
        const redirectUrl = response.get('Location');
        expect(redirectUrl).to.equal('/login');
      });

      it('login to loopback app', async () => {
        const response: supertest.Response = await client
          .post('/login_submit')
          .type('form')
          .send({
            email: 'test@example.com',
            password: 'password',
          })
          .expect(302);
        const setCookie: string[] = response.get('Set-Cookie');
        if (setCookie?.length) {
          Cookie = setCookie[0].split(';')[0];
        }
        expect(Cookie).to.containEql('session');
      });

      it('able to access account profile page while logged in', async () => {
        await client.get('/auth/account').set('Cookie', [Cookie]).expect(200);
      });

      it('able to access /api/whoAmI API endpoint with user session', async () => {
        await client.get('/api/whoAmI').set('Cookie', [Cookie]).expect(200);
      });

      it('access to account profile page is denied after log out', async () => {
        const response = await client
          .get('/logout')
          .set('Cookie', [Cookie])
          .expect(302);
        /**
         * replace existing cookie with cookie from logout response
         */
        const setCookie: string[] = response.get('Set-Cookie');
        if (setCookie?.length) {
          Cookie = setCookie[0].split(';')[0];
        }
        expect(Cookie).to.containEql('session');
        await client.get('/auth/account').set('Cookie', [Cookie]).expect(401);
      });

      it('access to /api/whoAmI API endpoint denied after logout', async () => {
        await client.get('/api/whoAmI').set('Cookie', [Cookie]).expect(401);
      });

      it('check if user was registered', async () => {
        const filter = 'filter={"where":{"email": "test@example.com"}}';
        const response = await client.get('/api/users').query(filter);
        const users = response.body as User[];
        expect(users.length).to.eql(1);
        expect(users[0].email).to.eql('test@example.com');
      });

      it('able to invoke api endpoints with basic auth', async () => {
        await client
          .get('/api/profiles')
          .auth('test@example.com', 'password', {type: 'basic'})
          .expect(204);
      });

      it('basic auth fails for incorrect password', async () => {
        await client
          .get('/api/profiles')
          .auth('test@example.com', 'incorrect-password', {type: 'basic'})
          .expect(401);
      });
    });

    /**
     *********************************************************
     *  Scenario 2: Link an external profile with a local user
     *********************************************************
     *    Test case 1: login via a social app profile having same email id as local user
     *    Test case 2: check if external profile is linked to local user
     *    Test case 3: logout
     */
    context('Scenario 2: Link an external profile with a local user', () => {
      let oauthProviderUrl: string;
      let providerLoginUrl: string;
      let loginPageParams: string;
      let callbackToLbApp: string;

      it('call is redirected to third party authorization url', async () => {
        const response = await client
          .get('/api/auth/thirdparty/oauth2')
          .expect(303);
        oauthProviderUrl = response.get('Location');
        expect(url.parse(oauthProviderUrl).pathname).to.equal('/oauth/dialog');
      });

      it('call to authorization url is redirected to oauth providers login page', async () => {
        const response = await supertest('').get(oauthProviderUrl).expect(302);
        providerLoginUrl = response.get('Location');
        loginPageParams = url.parse(providerLoginUrl).query ?? '';
        expect(url.parse(response.get('Location')).pathname).to.equal('/login');
      });

      /**
       * Sign Up via a social app with the following profile
       *   username: testuser
       *   email: test@example.com
       *
       * Email-id MATCHES local account
       */
      it('login page redirects to authorization app callback endpoint', async () => {
        const loginPageHiddenParams = qs.parse(loginPageParams);
        const params = {
          username: 'testuser',
          password: 'xyz',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: loginPageHiddenParams.client_id,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          redirect_uri: loginPageHiddenParams.redirect_uri,
          scope: loginPageHiddenParams.scope,
        };
        // On successful login, the authorizing app redirects to the callback url
        // HTTP status code 302 is returned to the browser
        const response = await supertest('http://localhost:9000')
          .post('/login_submit')
          .send(qs.stringify(params))
          .expect(302);
        callbackToLbApp = response.get('Location');
        expect(url.parse(callbackToLbApp).pathname).to.equal(
          '/api/auth/thirdparty/oauth2/callback',
        );
      });

      it('callback url contains access code', async () => {
        expect(url.parse(callbackToLbApp).query).to.containEql('code');
      });

      it('access code can be exchanged for token', async () => {
        const response = await client
          .get(url.parse(callbackToLbApp).path ?? '')
          .expect(302);
        expect(response.get('Location')).to.equal('/auth/account');
        const setCookie: string[] = response.get('Set-Cookie');
        if (setCookie?.length) {
          Cookie = setCookie[0].split(';')[0];
        }
        expect(Cookie).to.containEql('session');
      });

      it('able to access account profile page while logged in', async () => {
        await client.get('/auth/account').set('Cookie', [Cookie]).expect(200);
      });

      it('able to access /api/whoAmI API endpoint with user session', async () => {
        await client.get('/api/whoAmI').set('Cookie', [Cookie]).expect(200);
      });

      it('access to account profile page is denied after log out', async () => {
        const response = await client
          .get('/logout')
          .set('Cookie', [Cookie])
          .expect(302);
        /**
         * replace existing cookie with cookie from logout response
         */
        const setCookie: string[] = response.get('Set-Cookie');
        if (setCookie?.length) {
          Cookie = setCookie[0].split(';')[0];
        }
        expect(Cookie).to.containEql('session');
        await client.get('/auth/account').set('Cookie', [Cookie]).expect(401);
      });

      it('access to /api/whoAmI API endpoint denied after logout', async () => {
        await client.get('/api/whoAmI').set('Cookie', [Cookie]).expect(401);
      });

      it('check if profile is linked to existing user', async () => {
        const response = await client
          .get('/api/profiles')
          .auth('test@example.com', 'password', {type: 'basic'});
        const profiles = response.body as UserIdentity[];
        expect(profiles?.length).to.eql(1);
        expect(profiles[0].profile).to.eql({
          emails: [{value: 'test@example.com'}],
        });
        expect(profiles[0].provider).to.eql('custom-oauth2');
      });
    });

    /**
     ******************************************************************
     *  Scenario 3: Sign Up (create a new user) via an external profile
     ******************************************************************
     *    Test case 1: login via a social app profile having an email id not in local user registry
     *    Test case 2: check if new user is created for external profile
     *    Test case 3: logout
     */
    context(
      'Scenario 3: Sign Up (create a new user) via an external profile',
      () => {
        let oauthProviderUrl: string;
        let providerLoginUrl: string;
        let loginPageParams: string;
        let callbackToLbApp: string;

        it('call is redirected to third party authorization url', async () => {
          const response = await client
            .get('/api/auth/thirdparty/facebook')
            .expect(303);
          oauthProviderUrl = response.get('Location');
          expect(url.parse(oauthProviderUrl).pathname).to.equal(
            '/oauth/dialog',
          );
        });

        it('call to authorization url is redirected to oauth providers login page', async () => {
          const response = await supertest('')
            .get(oauthProviderUrl)
            .expect(302);
          providerLoginUrl = response.get('Location');
          loginPageParams = url.parse(providerLoginUrl).query ?? '';
          expect(url.parse(response.get('Location')).pathname).to.equal(
            '/login',
          );
        });

        /**
         * Sign Up via a social app with the following profile
         *   username: user1
         *   email: usr1@lb.com
         *
         * Email-id NOT registered in local accounts
         */
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
          const response = await supertest('http://localhost:9000')
            .post('/login_submit')
            .send(qs.stringify(params))
            .expect(302);
          callbackToLbApp = response.get('Location');
          expect(url.parse(callbackToLbApp).pathname).to.equal(
            '/api/auth/thirdparty/facebook/callback',
          );
        });

        it('callback url contains access code', async () => {
          expect(url.parse(callbackToLbApp).query).to.containEql('code');
        });

        it('access code can be exchanged for token', async () => {
          const response = await client
            .get(url.parse(callbackToLbApp).path ?? '')
            .expect(302);
          expect(response.get('Location')).to.equal('/auth/account');
          const setCookie: string[] = response.get('Set-Cookie');
          if (setCookie?.length) {
            Cookie = setCookie[0].split(';')[0];
          }
          expect(Cookie).to.containEql('session');
        });

        it('able to access account profile page while logged in', async () => {
          await client.get('/auth/account').set('Cookie', [Cookie]).expect(200);
        });

        it('able to access /api/whoAmI API endpoint with user session', async () => {
          await client.get('/api/whoAmI').set('Cookie', [Cookie]).expect(200);
        });

        it('access to account profile page is denied after log out', async () => {
          const response = await client
            .get('/logout')
            .set('Cookie', [Cookie])
            .expect(302);
          /**
           * replace existing cookie with cookie from logout response
           */
          const setCookie: string[] = response.get('Set-Cookie');
          if (setCookie?.length) {
            Cookie = setCookie[0].split(';')[0];
          }
          expect(Cookie).to.containEql('session');
          await client.get('/auth/account').set('Cookie', [Cookie]).expect(401);
        });

        it('access to /api/whoAmI API endpoint denied after logout', async () => {
          await client.get('/api/whoAmI').set('Cookie', [Cookie]).expect(401);
        });

        it('check if a new user was registered', async () => {
          const filter = 'filter={"where":{"email": "usr1@lb.com"}}';
          const response = await client.get('/api/users').query(filter);
          const users = response.body as User[];
          expect(users.length).to.eql(1);
          expect(users[0].email).to.eql('usr1@lb.com');
        });
      },
    );
  });
});
