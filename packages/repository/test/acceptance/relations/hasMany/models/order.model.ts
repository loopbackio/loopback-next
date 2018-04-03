// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity} from '../../../../../';
import {model, property, belongsTo} from '../../../../../src/decorators';

@model()
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  desc?: string;

  @property({
    type: 'date',
  })
  date?: string;

  @property({
    type: 'string',
    required: true,
  })
  @belongsTo({
    target: 'Customer',
    as: 'customer',
    foreignKey: 'customerId',
  })
  customerId: string;
}
