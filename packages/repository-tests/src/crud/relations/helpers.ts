// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudFeatures, CrudRepositoryCtor} from '../..';
import {
  Address,
  AddressRepository,
  CustomerRepository,
  Order,
  OrderRepository,
  ShipmentRepository,
} from './fixtures/models';
import {
  createAddressRepo,
  createCustomerRepo,
  createOrderRepo,
  createShipmentRepo,
} from './fixtures/repositories';

export function givenBoundCrudRepositories(
  db: juggler.DataSource,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  // when running the test suite on MongoDB, we don't really need to setup
  // this config for mongo connector to pass the test.
  // however real-world applications might have such config for MongoDB
  // setting it up to check if it works fine as well
  Order.definition.properties.customerId.type = features.idType;
  Order.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  Address.definition.properties.customerId.type = features.idType;
  Address.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  // get the repository class and create a new instance of it
  const customerRepoClass = createCustomerRepo(repositoryClass);
  const customerRepo: CustomerRepository = new customerRepoClass(
    db,
    async () => orderRepo,
    async () => addressRepo,
  );

  // register the inclusionResolvers here for customerRepo
  customerRepo.inclusionResolvers.set(
    'orders',
    customerRepo.orders.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'customers',
    customerRepo.customers.inclusionResolver,
  );
  customerRepo.inclusionResolvers.set(
    'address',
    customerRepo.address.inclusionResolver,
  );

  const orderRepoClass = createOrderRepo(repositoryClass);
  const orderRepo: OrderRepository = new orderRepoClass(
    db,
    async () => customerRepo,
    async () => shipmentRepo,
  );
  // register the inclusionResolvers here for orderRepo
  orderRepo.inclusionResolvers.set(
    'customer',
    orderRepo.customer.inclusionResolver,
  );

  const shipmentRepoClass = createShipmentRepo(repositoryClass);
  const shipmentRepo: ShipmentRepository = new shipmentRepoClass(
    db,
    async () => orderRepo,
  );

  const addressRepoClass = createAddressRepo(repositoryClass);
  const addressRepo: AddressRepository = new addressRepoClass(
    db,
    async () => customerRepo,
  );

  return {
    customerRepo,
    orderRepo,
    shipmentRepo,
    addressRepo,
  };
}
