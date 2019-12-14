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
    useDefaltIdType: true,
  })
  id: MixedIdType;

  @property({
    type: 'number',
  })
  shipment_id: number;

  @property({type: 'string'})
  name: string;

  // keyFrom is not the id property of Shipment
  @hasMany(() => Order, {keyFrom: 'shipment_id', keyTo: 'shipmentInfo'})
  shipmentOrders: Order[];

  constructor(data?: Partial<Shipment>) {
    super(data);
  }
}

export interface ShipmentRelations {
  shipmentOrders?: OrderWithRelations[];
}

export type ShipmentWithRelations = Shipment & ShipmentRelations;

export interface ShipmentRepository
  extends EntityCrudRepository<Shipment, typeof Shipment.prototype.id> {
  // define additional members like relation methods here
  shipmentOrders: HasManyRepositoryFactory<Order, MixedIdType>;
}
