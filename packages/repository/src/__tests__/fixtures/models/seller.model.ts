// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {hasMany, Entity, model, property} from '../../..';
import {Customer} from './customer.model';
import {Order} from './order.model';

@model()
export class Seller extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @hasMany(() => Customer, {through: () => Order})
  customers: Customer[];
}
