// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-references-many
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityNotFoundError} from '@loopback/repository';
import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {ReferencesManyApplication} from '../../application';
import {Customer} from '../../models/';
import {AccountRepository, CustomerRepository} from '../../repositories/';
import {
  givenRunningApplicationWithCustomConfiguration,
  givenCustomer,
  givenCustomerInstance,
  givenCustomerRepositories,
  givenAccountInstance,
} from '../helpers';

describe('ReferencesManyApplication', () => {
  let app: ReferencesManyApplication;
  let client: Client;
  let customerRepo: CustomerRepository;
  let accountRepo: AccountRepository;

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(async () => {
    ({customerRepo, accountRepo} = await givenCustomerRepositories(app));
  });
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await customerRepo.deleteAll();
    await accountRepo.deleteAll();
  });

  it('creates a customer', async function () {
    const customer = givenCustomer();
    const response = await client.post('/customers').send(customer).expect(200);
    expect(response.body).to.containDeep(customer);
    const result = await customerRepo.findById(response.body.id);
    expect(result).to.containDeep(customer);
  });

  it('gets a count of customers', async function () {
    await givenCustomerInstance(customerRepo, {
      firstName: 'Andrew',
      lastName: 'Jackson',
    });
    await givenCustomerInstance(customerRepo, {
      firstName: 'James',
      lastName: 'Gunn',
    });
    await client.get('/customers/count').expect(200, {count: 2});
  });

  context('when dealing with a single persisted customer', () => {
    let persistedCustomer: Customer;

    beforeEach(async () => {
      persistedCustomer = await givenCustomerInstance(customerRepo);
    });

    it('gets a customer by ID', () => {
      return client
        .get(`/customers/${persistedCustomer.id}`)
        .send()
        .expect(200, toJSON(persistedCustomer));
    });

    it('returns 404 when getting a customer that does not exist', () => {
      return client.get('/customers/99999').expect(404);
    });

    it('replaces the customer by ID', async () => {
      const updatedCustomer = givenCustomer({
        firstName: 'Andrew',
        lastName: 'Jackson',
      });
      await client
        .put(`/customers/${persistedCustomer.id}`)
        .send(updatedCustomer)
        .expect(204);
      const result = await customerRepo.findById(persistedCustomer.id);
      expect(result).to.containEql(updatedCustomer);
    });

    it('returns 404 when replacing a customer that does not exist', () => {
      return client.put('/customers/99999').send(givenCustomer()).expect(404);
    });

    it('updates the customer by ID ', async () => {
      const updatedCustomer = givenCustomer({
        firstName: 'Tommy',
        lastName: 'Jeans',
      });
      await client
        .patch(`/customers/${persistedCustomer.id}`)
        .send(updatedCustomer)
        .expect(204);
      const result = await customerRepo.findById(persistedCustomer.id);
      expect(result).to.containEql(updatedCustomer);
    });

    it('returns 404 when updating a customer that does not exist', () => {
      return client.patch('/customer/99999').send(givenCustomer()).expect(404);
    });

    it('deletes the customer', async () => {
      await client.del(`/customers/${persistedCustomer.id}`).send().expect(204);
      await expect(
        customerRepo.findById(persistedCustomer.id),
      ).to.be.rejectedWith(EntityNotFoundError);
    });

    it('returns 404 when deleting a customer that does not exist', async () => {
      await client.del(`/customers/99999`).expect(404);
    });
  });

  it('queries customers with a filter', async () => {
    await givenCustomerInstance(customerRepo, {
      firstName: 'Andrew',
      lastName: 'Jackson',
    });

    const unnamedCustomer = await givenCustomerInstance(customerRepo, {
      firstName: '',
      lastName: '',
    });

    await client
      .get('/customers')
      .query({filter: {where: {firstName: ''}}})
      .expect(200, [toJSON(unnamedCustomer)]);
  });

  it('updates customers using a filter', async () => {
    await givenCustomerInstance(customerRepo, {
      firstName: 'Andrew',
      lastName: 'Jackson',
    });
    await givenCustomerInstance(customerRepo, {
      firstName: 'James',
      lastName: 'Gunn',
    });
    await client
      .patch('/customers')
      .query({where: {firstName: 'Andrew'}})
      .send({firstName: 'Tommy'})
      .expect(200, {count: 1});
  });

  it('includes Accounts in query result', async () => {
    const firstAccount = await givenAccountInstance(accountRepo, {balance: 10});
    const secondAccount = await givenAccountInstance(accountRepo, {
      balance: 20,
    });
    const customer = await givenCustomerInstance(customerRepo);
    const customerWithAccounts = await givenCustomerInstance(customerRepo, {
      accountIds: [firstAccount.id, secondAccount.id],
    });
    const filter = JSON.stringify({include: ['accounts']});

    const response = await client.get('/customers').query({filter: filter});

    expect(response.body).to.have.length(2);
    expect(response.body[0]).to.deepEqual({
      ...toJSON(customer),
      accounts: [],
    });
    expect(response.body[1]).to.deepEqual({
      ...toJSON(customerWithAccounts),
      accounts: [toJSON(firstAccount), toJSON(secondAccount)],
    });
  });

  it('not includes a not existed Account in query result', async () => {
    const notExistedId = 1;
    const customer = await givenCustomerInstance(customerRepo, {
      accountIds: [notExistedId],
    });
    const filter = JSON.stringify({include: ['accounts']});

    const response = await client.get('/customers').query({filter: filter});

    expect(response.body).to.have.length(1);
    expect(response.body[0]).to.deepEqual({
      ...toJSON(customer),
      accounts: [],
    });
  });
});
