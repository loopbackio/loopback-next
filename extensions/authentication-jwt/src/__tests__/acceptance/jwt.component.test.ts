// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {genSalt, hash} from 'bcryptjs';
import * as _ from 'lodash';
import {UserServiceBindings} from '../..';
import {OPERATION_SECURITY_SPEC, SECURITY_SCHEME_SPEC} from '../../';
import {UserRepository} from '../../repositories';
import {TestApplication} from '../fixtures/application';

describe('jwt authentication', () => {
  let app: TestApplication;
  let client: Client;
  let token: string;
  let userRepo: UserRepository;
  let refreshToken: string;
  let tokenAuth: string;
  before(givenRunningApplication);
  before(() => {
    client = createRestAppClient(app);
  });
  after(async () => {
    await app.stop();
  });

  it(`user login successfully`, async () => {
    const credentials = {email: 'jane@doe.com', password: 'opensesame'};
    const res = await client.post('/users/login').send(credentials).expect(200);
    token = res.body.token;
  });

  it('whoAmI returns the login user id', async () => {
    const res = await client
      .get('/whoAmI')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
    expect(res.text).to.equal('f48b7167-8d95-451c-bbfc-8a12cd49e763');
  });

  it('generates openapi spec provided by enhancer', async () => {
    const spec = await app.restServer.getApiSpec();
    expect(spec.security).to.eql(OPERATION_SECURITY_SPEC);
    expect(spec.components?.securitySchemes).to.eql(SECURITY_SCHEME_SPEC);
  });

  it(`user login and token granted successfully`, async () => {
    const credentials = {email: 'jane@doe.com', password: 'opensesame'};
    const res = await client
      .post('/users/refresh-login')
      .send(credentials)
      .expect(200);
    refreshToken = res.body.refreshToken;
  });

  it(`user sends refresh token and new access token issued`, async () => {
    const tokenArg = {refreshToken: refreshToken};
    const res = await client.post('/refresh/').send(tokenArg).expect(200);
    tokenAuth = res.body.accessToken;
  });

  it('whoAmI returns the login user id using token generated from refresh', async () => {
    const res = await client
      .get('/whoAmI')
      .set('Authorization', 'Bearer ' + tokenAuth)
      .expect(200);
    expect(res.text).to.equal('f48b7167-8d95-451c-bbfc-8a12cd49e763');
  });

  /*
   ============================================================================
   TEST HELPERS
   ============================================================================
   */

  async function givenRunningApplication() {
    app = new TestApplication({
      rest: givenHttpServerConfig(),
    });

    await app.boot();
    userRepo = await app.get(UserServiceBindings.USER_REPOSITORY);
    await createUsers();
    await app.start();
  }

  async function createUsers(): Promise<void> {
    const hashedPassword = await hashPassword('opensesame', 10);
    //providing UUID() to test
    const users = [
      {
        id: 'a75337c0-78d2-4b44-8037-20e22d5e2508',
        username: 'John',
        email: 'john@doe.com',
        password: hashedPassword,
      },
      {
        id: 'f48b7167-8d95-451c-bbfc-8a12cd49e763',
        username: 'Jane',
        email: 'jane@doe.com',
        password: hashedPassword,
      },
      {
        id: 'bbb5e8a0-fc86-4573-aeab-c950c38dc7a1',
        username: 'Bob',
        email: 'bob@projects.com',
        password: hashedPassword,
      },
    ];

    for (const u of users) {
      await userRepo.create(_.pick(u, ['id', 'email', 'username']));
      await userRepo
        .userCredentials(u.id)
        .create({password: u.password, userId: u.id});
    }
  }

  async function hashPassword(
    password: string,
    rounds: number,
  ): Promise<string> {
    const salt = await genSalt(rounds);
    return hash(password, salt);
  }
});
