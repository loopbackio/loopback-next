// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, hasMany, hasOne, model, property} from '../../..';
import {Address, AddressWithRelations} from './address.model';
import {Order, OrderWithRelations} from './order.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @hasMany(() => Order)
  orders: Order[];

  @hasOne(() => Address)
  address: Address;

  @hasMany(() => Customer, {keyTo: 'parentId'})
  customers?: Customer[];

  @belongsTo(() => Customer)
  parentId?: number;
}

export interface CustomerRelations {
  address?: AddressWithRelations;
  orders?: OrderWithRelations[];
  customers?: CustomerWithRelations[];
  parentCustomer?: CustomerWithRelations;
}

export type CustomerWithRelations = Customer & CustomerRelations;
