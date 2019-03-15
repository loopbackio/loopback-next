// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
  BelongsToAccessor,
} from '../../..';
import {Customer, Order, Address} from '../models';
import {OrderRepository} from './order.repository';
import {HasOneRepositoryFactory} from '../../../';
import {AddressRepository} from './address.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Customer.prototype.id
  >;
  public readonly address: HasOneRepositoryFactory<
    Address,
    typeof Customer.prototype.id
  >;
  public readonly customers: HasManyRepositoryFactory<
    Customer,
    typeof Customer.prototype.id
  >;
  public readonly parent: BelongsToAccessor<
    Customer,
    typeof Customer.prototype.id
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
    @repository.getter('AddressRepository')
    addressRepositoryGetter: Getter<AddressRepository>,
  ) {
    super(Customer, db);
    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
    this.address = this.createHasOneRepositoryFactoryFor(
      'address',
      addressRepositoryGetter,
    );
    this.customers = this.createHasManyRepositoryFactoryFor(
      'customers',
      Getter.fromValue(this),
    );
    this.parent = this.createBelongsToAccessorFor(
      'parent',
      Getter.fromValue(this),
    );
  }
}
