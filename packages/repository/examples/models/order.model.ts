// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '../..';
import {Customer} from './customer.model';

/* eslint-disable @typescript-eslint/no-unused-vars */

@model()
class Order extends Entity {
  @property({
    // TODO(bajtos) type should be optional for TypeScript based properties,
    // as simple types string, number, boolean can be inferred
    type: 'number',
    mysql: {
      column: 'QTY',
    },
  })
  quantity: number;

  // TODO(bajtos) type should be optional for TypeScript based properties,
  // as simple types string, number, boolean can be inferred
  @property({type: 'string', id: true, generated: true})
  id: string;

  @belongsTo(() => Customer)
  customerId: string;
}
