// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property, ModelDefinition, belongsTo} from '../../..';
import {Customer} from './customer.model';

@model()
export class Address extends Entity {
  @property({
    type: 'string',
  })
  street: String;
  @property({
    type: 'string',
    id: true,
  })
  zipcode: String;
  @property({
    type: 'string',
  })
  city: String;
  @property({
    type: 'string',
  })
  province: String;

  @belongsTo(() => Customer)
  customerId: number;
}
