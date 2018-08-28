// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Customer, Order} from '../models';
import {OrderRepository} from './order.repository';
import {
  DefaultCrudRepository,
  HasManyAccessor,
  juggler,
  repository,
} from '../../..';
import {inject, Getter} from '@loopback/context';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  public orders: HasManyAccessor<Order, typeof Customer.prototype.id>;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('repositories.OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Customer, db);
    this.orders = this._createHasManyAccessorFor(
      'orders',
      orderRepositoryGetter,
    );
  }
}
