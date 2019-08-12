// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  BelongsToAccessor,
  Entity,
  EntityCrudRepository,
  model,
  property,
} from '@loopback/repository';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Customer, CustomerWithRelations} from './customer.model';

@model()
export class Address extends Entity {
  @property({
    id: true,
    generated: true,
  })
  id: MixedIdType;
  @property({
    type: 'string',
  })
  street: string;
  @property({
    type: 'string',
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
  customerId: MixedIdType;
}

export interface AddressRelations {
  customer?: CustomerWithRelations;
}

export type AddressWithRelations = Address & AddressRelations;

export interface AddressRepository
  extends EntityCrudRepository<Address, typeof Address.prototype.id> {
  // define additional members like relation methods here
  customer?: BelongsToAccessor<Customer, MixedIdType>;
}
