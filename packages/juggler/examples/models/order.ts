// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity} from '../../src/model';
import {property, model, belongsTo} from '../../src/decorator';
import {Customer} from './customer';

@model()
class Order extends Entity {
  @property({name: 'qty', mysql: {
    column: 'QTY',
  }})
  quantity: number;

  @property({name: 'id', id: true, generated: true})
  id: string;
  customerId: string;

  @belongsTo()
  customer: Customer;
}
