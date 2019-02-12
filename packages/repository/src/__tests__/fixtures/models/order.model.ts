// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '../../..';
import {Customer} from './customer.model';

@model()
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'boolean',
    required: false,
  })
  isShipped: boolean;

  @belongsTo(() => Customer)
  customerId: number;
}
