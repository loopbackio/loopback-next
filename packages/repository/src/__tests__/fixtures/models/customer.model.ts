// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, hasMany, model, property, hasOne} from '../../..';
import {Order} from './order.model';
import {Address} from './address.model';

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
}
