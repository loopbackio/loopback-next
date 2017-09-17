// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity} from '../../src/model';
import {property, model} from '../../src/decorators/model';
import {belongsTo} from '../../src/decorators/relation';
import {Customer} from './customer';

// tslint:disable:no-unused-variable

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
  customerId: string;

  @belongsTo() customer: Customer;
}
