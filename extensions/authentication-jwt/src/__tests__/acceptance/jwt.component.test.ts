// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/extension-authentication-jwt
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
import {UserRepository} from '../../repositories';
import {TestApplication} from '../fixtures/application';

describe('jwt authentication', () => {
  let app: TestApplication;
  let client: Client;
  let token: string;
  let userRepo: UserRepository;

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
    expect(res.text).to.equal('2');
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
    const users = [
      {
        id: 1,
        username: 'John',
        email: 'john@doe.com',
        password: hashedPassword,
      },
      {
        id: 2,
        username: 'Jane',
        email: 'jane@doe.com',
        password: hashedPassword,
      },
      {
        id: 3,
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
