// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  juggler,
  repository,
} from '../../..';
import {Customer, Order, OrderRelations, Shipment} from '../models';
import {CustomerRepository, ShipmentRepository} from '../repositories';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly customer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;
  public readonly shipment: BelongsToAccessor<
    Shipment,
    typeof Order.prototype.id
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('CustomerRepository')
    customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('ShipmentRepository')
    shipmentRepositoryGetter: Getter<ShipmentRepository>,
  ) {
    super(Order, db);
    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );
    this.shipment = this.createBelongsToAccessorFor(
      'shipment_id',
      shipmentRepositoryGetter,
    );
  }
}
