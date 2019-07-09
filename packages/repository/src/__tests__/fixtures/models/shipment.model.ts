// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, hasMany, model, property} from '../../..';
import {Order, OrderWithRelations} from './order.model';

@model()
export class Shipment extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

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
