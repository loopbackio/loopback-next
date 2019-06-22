// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '../../..';
import {Customer, CustomerWithRelations} from './customer.model';

@model()
export class Address extends Entity {
  @property({
    type: 'string',
  })
  street: string;
  @property({
    type: 'string',
    id: true,
  })
  zipcode: string;
  @property({
    type: 'string',
  })
  city: string;
  @property({
    type: 'string',
  })
  province: string;

  @belongsTo(() => Customer)
  customerId: number;
}

export interface AddressRelations {
  customer?: CustomerWithRelations;
}

export type AddressWithRelations = Address & AddressRelations;
