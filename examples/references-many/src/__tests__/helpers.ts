// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-references-many
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {givenHttpServerConfig} from '@loopback/testlab';
import {ReferencesManyApplication} from '../application';
import {Account, Customer} from '../models';
import {AccountRepository, CustomerRepository} from '../repositories';

/*
 ==============================================================================
 HELPER FUNCTIONS
 If you find yourself creating the same helper functions across different
 test files, then extracting those functions into helper modules is an easy
 way to reduce duplication.

 Other tips:

 - Using the super awesome Partial<T> type in conjunction with Object.assign
   means you can:
   * customize the object you get back based only on what's important
   to you during a particular test
   * avoid writing test logic that is brittle with respect to the properties
   of your object
 - Making the input itself optional means you don't need to do anything special
   for tests where the particular details of the input don't matter.
 ==============================================================================
 */

/**
 * Generate a complete Customer object for use with tests.
 * @param customer - A partial (or complete) Customer object.
 */
export function givenCustomer(customer?: Partial<Customer>) {
  const data = Object.assign(
    {
      firstName: 'John',
      lastName: 'Doe',
    },
    customer,
  );
  return new Customer(data);
}

/**
 * Generate a complete Account object for use with tests.
 * @param account - A partial (or complete) Account object.
 */
export function givenAccount(account?: Partial<Account>) {
  const data = Object.assign({balance: 999}, account);
  return new Account(data);
}

export async function givenRunningApplicationWithCustomConfiguration() {
  const app = new ReferencesManyApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();

  /**
   * Override default config for DataSource for testing so we don't write
   * test data to file when using the memory connector.
   */
  app.bind('datasources.config.db').to({
    name: 'db',
    connector: 'memory',
  });

  // Start Application
  await app.start();
  return app;
}

export async function givenCustomerRepositories(
  app: ReferencesManyApplication,
) {
  const customerRepo = await app.getRepository(CustomerRepository);
  const accountRepo = await app.getRepository(AccountRepository);
  return {customerRepo, accountRepo};
}

export async function givenAccountRepositories(app: ReferencesManyApplication) {
  const accountRepo = await app.getRepository(AccountRepository);
  return {accountRepo};
}

export async function givenCustomerInstance(
  customerRepo: CustomerRepository,
  customer?: Partial<Customer>,
) {
  return customerRepo.create(givenCustomer(customer));
}

export async function givenAccountInstance(
  accountRepo: AccountRepository,
  account?: Partial<Account>,
) {
  return accountRepo.create(givenAccount(account));
}

export async function givenEmptyDatabase() {
  const accountRepo: AccountRepository = new AccountRepository(testdb);
  const customerRepo: CustomerRepository = new CustomerRepository(
    testdb,
    async () => accountRepo,
    async () => customerRepo,
  );

  await accountRepo.deleteAll();
  await customerRepo.deleteAll();
}

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});
