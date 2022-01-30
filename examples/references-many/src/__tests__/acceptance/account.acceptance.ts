// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-references-many
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityNotFoundError} from '@loopback/repository';
import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {ReferencesManyApplication} from '../../application';
import {Account} from '../../models/';
import {AccountRepository} from '../../repositories/';
import {
  givenRunningApplicationWithCustomConfiguration,
  givenAccount,
  givenAccountInstance,
  givenAccountRepositories,
} from '../helpers';

describe('ReferencesManyApplication', () => {
  let app: ReferencesManyApplication;
  let client: Client;
  let accountRepo: AccountRepository;

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(async () => {
    ({accountRepo} = await givenAccountRepositories(app));
  });
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await accountRepo.deleteAll();
  });

  it('creates an account', async function () {
    const account = givenAccount();
    const response = await client.post('/accounts').send(account).expect(200);
    expect(response.body).to.containDeep(account);
    const result = await accountRepo.findById(response.body.id);
    expect(result).to.containDeep(account);
  });

  it('gets a count of accounts', async function () {
    await givenAccountInstance(accountRepo, {balance: 22});
    await givenAccountInstance(accountRepo, {balance: 33});
    await client.get('/accounts/count').expect(200, {count: 2});
  });

  context('when dealing with a single persisted account', () => {
    let persistedAccount: Account;

    beforeEach(async () => {
      persistedAccount = await givenAccountInstance(accountRepo);
    });

    it('gets an account by ID', () => {
      return client
        .get(`/accounts/${persistedAccount.id}`)
        .send()
        .expect(200, toJSON(persistedAccount));
    });

    it('returns 404 when getting an account that does not exist', () => {
      return client.get('/accounts/99999').expect(404);
    });

    it('replaces the account by ID', async () => {
      const updatedAccount = givenAccount({
        balance: 44,
      });
      await client
        .put(`/accounts/${persistedAccount.id}`)
        .send(updatedAccount)
        .expect(204);
      const result = await accountRepo.findById(persistedAccount.id);
      expect(result).to.containEql(updatedAccount);
    });

    it('returns 404 when replacing an account that does not exist', () => {
      return client.put('/accounts/99999').send(givenAccount()).expect(404);
    });

    it('updates the account by ID ', async () => {
      const updatedAccount = givenAccount({
        balance: 55,
      });
      await client
        .patch(`/accounts/${persistedAccount.id}`)
        .send(updatedAccount)
        .expect(204);
      const result = await accountRepo.findById(persistedAccount.id);
      expect(result).to.containEql(updatedAccount);
    });

    it('returns 404 when updating an account that does not exist', () => {
      return client.patch('/account/99999').send(givenAccount()).expect(404);
    });

    it('deletes the account', async () => {
      await client.del(`/accounts/${persistedAccount.id}`).send().expect(204);
      await expect(
        accountRepo.findById(persistedAccount.id),
      ).to.be.rejectedWith(EntityNotFoundError);
    });

    it('returns 404 when deleting an account that does not exist', async () => {
      await client.del(`/accounts/99999`).expect(404);
    });
  });

  it('queries accounts with a filter', async () => {
    await givenAccountInstance(accountRepo, {balance: 77});

    const emptyAccount = await givenAccountInstance(accountRepo, {balance: 0});

    await client
      .get('/accounts')
      .query({filter: {where: {balance: 0}}})
      .expect(200, [toJSON(emptyAccount)]);
  });

  it('updates accounts using a filter', async () => {
    await givenAccountInstance(accountRepo, {
      balance: 1,
    });
    await givenAccountInstance(accountRepo, {
      balance: 2,
    });
    await client
      .patch('/accounts')
      .query({where: {balance: 2}})
      .send({balance: 3})
      .expect(200, {count: 1});
  });
});
