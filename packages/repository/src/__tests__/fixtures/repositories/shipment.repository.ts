// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/context';
import {OrderRepository} from '.';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  juggler,
  repository,
} from '../../..';
import {Order, Shipment, ShipmentRelations} from '../models';

export class ShipmentRepository extends DefaultCrudRepository<
  Shipment,
  typeof Shipment.prototype.id,
  ShipmentRelations
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Shipment.prototype.id
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Shipment, db);
    this.orders = this.createHasManyRepositoryFactoryFor(
      'shipmentOrders',
      orderRepositoryGetter,
    );
  }
}
