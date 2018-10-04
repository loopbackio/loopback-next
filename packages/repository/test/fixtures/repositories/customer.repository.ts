// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
} from '../../..';
import {Customer, Order} from '../models';
import {OrderRepository} from './order.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Customer.prototype.id
  >;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Customer, db);
    this.orders = this._createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
  }
}
