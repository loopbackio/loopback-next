// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
} from '../../..';
import {HasOneRepositoryFactory} from '../../../';
import {Address, Customer, CustomerRelations, Order} from '../models';
import {AddressRepository} from './address.repository';
import {OrderRepository} from './order.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
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
