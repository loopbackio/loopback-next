// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  hasMany,
  HasManyRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Order, OrderWithRelations} from './order.model';

@model()
export class Shipment extends Entity {
  @property({
    id: true,
    generated: true,
  })
  id: MixedIdType;

  @property({type: 'string'})
  name: string;

  @hasMany(() => Order, {keyTo: 'shipment_id'})
  shipmentOrders: Order[];

  constructor(data?: Partial<Shipment>) {
    super(data);
  }
}

export interface ShipmentRelations {
  orders?: OrderWithRelations[];
}

export type ShipmentWithRelations = Shipment & ShipmentRelations;

export interface ShipmentRepository
  extends EntityCrudRepository<Shipment, typeof Shipment.prototype.id> {
  // define additional members like relation methods here
  orders: HasManyRepositoryFactory<Order, MixedIdType>;
}
