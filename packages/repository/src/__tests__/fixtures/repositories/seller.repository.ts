// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {
  HasManyThroughRepositoryFactory,
  DefaultCrudRepository,
  juggler,
  repository,
} from '../../..';
import {Customer, Seller, Order} from '../models';
import {CustomerRepository, OrderRepository} from '../repositories';

export class SellerRepository extends DefaultCrudRepository<
  Seller,
  typeof Seller.prototype.id
> {
  public readonly customers: HasManyThroughRepositoryFactory<
    Customer,
    Order,
    typeof Seller.prototype.id
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('CustomerRepository')
    customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Seller, db);

    this.customers = this.createHasManyThroughRepositoryFactoryFor(
      'customers',
      customerRepositoryGetter,
      orderRepositoryGetter,
    );
  }
}
