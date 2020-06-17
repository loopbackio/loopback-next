// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudFeatures, CrudRepositoryCtor} from '../..';
import {
  Address,
  AddressRepository,
  CartItem,
  CartItemRepository,
  Customer,
  CustomerCartItemLink,
  CustomerCartItemLinkRepository,
  CustomerRepository,
  Order,
  OrderRepository,
  Shipment,
  ShipmentRepository,
} from './fixtures/models';
import {
  createAddressRepo,
  createCartItemRepo,
  createCustomerCartItemLinkRepo,
  createCustomerRepo,
  createOrderRepo,
  createShipmentRepo,
} from './fixtures/repositories';

export function givenBoundCrudRepositories(
  db: juggler.DataSource,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  Order.definition.properties.id.type = features.idType;
  Address.definition.properties.id.type = features.idType;
  Customer.definition.properties.id.type = features.idType;
  CartItem.definition.properties.id.type = features.idType;
  CustomerCartItemLink.definition.properties.id.type = features.idType;
  Shipment.definition.properties.id.type = features.idType;
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
  CustomerCartItemLink.definition.properties.customerId.type = features.idType;
  CustomerCartItemLink.definition.properties.customerId.mongodb = {
    dataType: 'ObjectID',
  };
  CustomerCartItemLink.definition.properties.cartItemId.type = features.idType;
  CustomerCartItemLink.definition.properties.cartItemId.mongodb = {
    dataType: 'ObjectID',
  };
  // get the repository class and create a new instance of it
  const customerRepoClass = createCustomerRepo(repositoryClass);
  const customerRepo: CustomerRepository = new customerRepoClass(
    db,
    async () => orderRepo,
    async () => addressRepo,
    async () => cartItemRepo,
    async () => customerCartItemLinkRepo,
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

  shipmentRepo.inclusionResolvers.set(
    'shipmentOrders',
    shipmentRepo.shipmentOrders.inclusionResolver,
  );

  const addressRepoClass = createAddressRepo(repositoryClass);
  const addressRepo: AddressRepository = new addressRepoClass(
    db,
    async () => customerRepo,
  );

  const cartItemRepoClass = createCartItemRepo(repositoryClass);
  const cartItemRepo: CartItemRepository = new cartItemRepoClass(db);

  const customerCartItemLinkRepoClass = createCustomerCartItemLinkRepo(
    repositoryClass,
  );
  const customerCartItemLinkRepo: CustomerCartItemLinkRepository = new customerCartItemLinkRepoClass(
    db,
  );

  return {
    customerRepo,
    orderRepo,
    shipmentRepo,
    addressRepo,
    cartItemRepo,
    customerCartItemLinkRepo,
  };
}
