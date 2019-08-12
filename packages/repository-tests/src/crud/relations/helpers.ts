// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudRepositoryCtor} from '../..';
import {
  AddressRepository,
  CustomerRepository,
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
) {
  // get the repository class and create a new instance of it
  const customerRepoClass = createCustomerRepo(repositoryClass);
  const customerRepo: CustomerRepository = new customerRepoClass(
    db,
    async () => orderRepo,
    async () => addressRepo,
  );

  const orderRepoClass = createOrderRepo(repositoryClass);
  const orderRepo: OrderRepository = new orderRepoClass(
    db,
    async () => customerRepo,
    async () => shipmentRepo,
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

  return {customerRepo, orderRepo, shipmentRepo, addressRepo};
}
