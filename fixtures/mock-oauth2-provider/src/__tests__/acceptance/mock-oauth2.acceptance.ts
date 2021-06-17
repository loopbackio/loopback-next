// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/mock-oauth2-provider
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {supertest} from '@loopback/testlab';
import {Server} from 'http';
import {MockTestOauth2SocialApp} from '../..';

describe('mock-oauth2-provider', () => {
  let server: Server;
  before(() => (server = MockTestOauth2SocialApp.startMock(0)));
  after(MockTestOauth2SocialApp.stopMock);

  it('exposes GET /login', () => {
    return supertest(server).get('/login').expect(200);
  });

  it('exposes GET /verify', () => {
    return supertest(server)
      .get('/verify?access_token=123')
      .expect(401, {error: 'invalid token'});
  });

  it('exposes GET /oauth/dialog', () => {
    return supertest(server)
      .get('/oauth/dialog')
      .query({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uri: 'http://localhost:3000/callback',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: '1111',
      })
      .expect(302)
      .expect(
        'location',
        '/login?client_id=1111&redirect_uri=http://localhost:3000/callback',
      );
  });

  it('exposes GET /oauth/dialog with scope', () => {
    return supertest(server)
      .get('/oauth/dialog')
      .query({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uri: 'http://localhost:3000/callback',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: '1111',
        scope: 'email',
      })
      .expect(302)
      .expect(
        'location',
        '/login?client_id=1111&redirect_uri=http://localhost:3000/callback&scope=email',
      );
  });

  it('exposes GET /oauth/dialog - missing redirect_uri', () => {
    return supertest(server)
      .get('/oauth/dialog')
      .expect(400, {error: 'missing redirect_uri'});
  });

  it('exposes GET /oauth/dialog - missing client_id', () => {
    return (
      supertest(server)
        .get('/oauth/dialog')
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .query({redirect_uri: 'http://localhost:3000/callback'})
        .expect(400, {error: 'missing client_id'})
    );
  });

  it('exposes GET /oauth/token - invalid client id', () => {
    return supertest(server)
      .get('/oauth/token?client_id=123')
      .expect(401, {error: 'invalid client id'});
  });

  it('exposes GET /oauth/token', () => {
    return supertest(server)
      .get('/oauth/token?client_id=1111')
      .expect(401, {error: 'invalid code'});
  });
});
