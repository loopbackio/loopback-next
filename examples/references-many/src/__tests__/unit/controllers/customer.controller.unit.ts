// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-customer-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  createStubInstance,
  expect,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {CustomerController} from '../../../controllers';
import {Customer} from '../../../models';
import {CustomerRepository} from '../../../repositories';
import {givenCustomer} from '../../helpers';

describe('CustomerController', () => {
  let customerRepo: StubbedInstanceWithSinonAccessor<CustomerRepository>;

  /*
  =============================================================================
  TEST VARIABLES
  Combining top-level objects with our resetRepositories method means we don't
  need to duplicate several variable assignments (and generation statements)
  in all of our test logic.

  NOTE: If you wanted to parallelize your test runs, you should avoid this
  pattern since each of these tests is sharing references.
  =============================================================================
  */
  let controller: CustomerController;
  let aCustomer: Customer;
  let aCustomerWithId: Customer;
  let aChangedCustomer: Customer;
  let aListOfCustomers: Customer[];

  beforeEach(resetRepositories);

  describe('createCustomer', () => {
    it('creates a Customer', async () => {
      const create = customerRepo.stubs.create;
      create.resolves(aCustomerWithId);
      const result = await controller.create(aCustomer);
      expect(result).to.eql(aCustomerWithId);
      sinon.assert.calledWith(create, aCustomer);
    });
  });

  describe('findCustomerById', () => {
    it('returns a customer if it exists', async () => {
      const findById = customerRepo.stubs.findById;
      findById.resolves(aCustomerWithId);
      expect(await controller.findById(aCustomerWithId.id as number)).to.eql(
        aCustomerWithId,
      );
      sinon.assert.calledWith(findById, aCustomerWithId.id);
    });
  });

  describe('findCustomers', () => {
    it('returns multiple customers if they exist', async () => {
      const find = customerRepo.stubs.find;
      find.resolves(aListOfCustomers);
      expect(await controller.find()).to.eql(aListOfCustomers);
      sinon.assert.called(find);
    });

    it('returns empty list if no customers exist', async () => {
      const find = customerRepo.stubs.find;
      const expected: Customer[] = [];
      find.resolves(expected);
      expect(await controller.find()).to.eql(expected);
      sinon.assert.called(find);
    });
  });

  describe('replaceCustomer', () => {
    it('successfully replaces existing items', async () => {
      const replaceById = customerRepo.stubs.replaceById;
      replaceById.resolves();
      await controller.replaceById(
        aCustomerWithId.id as number,
        aChangedCustomer,
      );
      sinon.assert.calledWith(
        replaceById,
        aCustomerWithId.id,
        aChangedCustomer,
      );
    });
  });

  describe('updateCustomer', () => {
    it('successfully updates existing items', async () => {
      const updateById = customerRepo.stubs.updateById;
      updateById.resolves();
      await controller.updateById(
        aCustomerWithId.id as number,
        aChangedCustomer,
      );
      sinon.assert.calledWith(updateById, aCustomerWithId.id, aChangedCustomer);
    });
  });

  describe('deleteCustomer', () => {
    it('successfully deletes existing items', async () => {
      const deleteById = customerRepo.stubs.deleteById;
      deleteById.resolves();
      await controller.deleteById(aCustomerWithId.id as number);
      sinon.assert.calledWith(deleteById, aCustomerWithId.id);
    });
  });

  function resetRepositories() {
    customerRepo = createStubInstance(CustomerRepository);
    aCustomer = givenCustomer();
    aCustomerWithId = givenCustomer({
      id: 1,
    });
    aListOfCustomers = [
      aCustomerWithId,
      givenCustomer({
        id: 2,
        firstName: 'Dave',
        lastName: 'Brubeck',
      }),
    ] as Customer[];
    aChangedCustomer = givenCustomer({
      id: aCustomerWithId.id,
      firstName: 'Tim',
      lastName: 'Benton',
    });

    controller = new CustomerController(customerRepo);
  }
});
