// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-references-many
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {AccountRepository, CustomerRepository} from '../../repositories';
import {
  givenEmptyDatabase,
  givenAccountInstance,
  givenCustomerInstance,
  testdb,
} from '../helpers';

describe('ReferencesManyRepository', () => {
  let accountRepo: AccountRepository;
  let customerRepo: CustomerRepository;

  before(async () => {
    accountRepo = new AccountRepository(testdb);
    customerRepo = new CustomerRepository(
      testdb,
      async () => accountRepo,
      async () => customerRepo,
    );
  });

  beforeEach(givenEmptyDatabase);

  it('includes Accounts in find method result', async () => {
    const account = await givenAccountInstance(accountRepo);
    const customer = await givenCustomerInstance(customerRepo, {
      accountIds: [account.id],
    });

    const response = await customerRepo.find({
      include: ['accounts'],
    });

    expect(toJSON(response)).to.deepEqual([
      {
        ...toJSON(customer),
        accounts: [toJSON(account)],
      },
    ]);
  });

  it('includes Accounts in findById result', async () => {
    const account = await givenAccountInstance(accountRepo);
    const customer = await givenCustomerInstance(customerRepo, {
      accountIds: [account.id],
    });

    const response = await customerRepo.findById(customer.id, {
      include: ['accounts'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(customer),
      accounts: [toJSON(account)],
    });
  });

  it('includes Accounts in findOne method result', async () => {
    const account = await givenAccountInstance(accountRepo);
    const customer = await givenCustomerInstance(customerRepo, {
      accountIds: [account.id],
    });

    const response = await customerRepo.findOne({
      where: {id: customer.id},
      include: ['accounts'],
    });

    expect(toJSON(response)).to.deepEqual({
      ...toJSON(customer),
      accounts: [toJSON(account)],
    });
  });
});
