// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  Entity,
  EntityCrudRepository,
  hasMany,
  HasManyRepositoryFactory,
  hasOne,
  HasOneRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {BelongsToAccessor} from '@loopback/repository/src';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {Address, AddressWithRelations} from './address.model';
import {Order, OrderWithRelations} from './order.model';

@model()
export class Customer extends Entity {
  @property({
    id: true,
    generated: true,
  })
  id: MixedIdType;

  @property({
    type: 'string',
  })
  name: string;

  @hasMany(() => Order)
  orders: Order[];

  @hasOne(() => Address)
  address: Address;

  @hasMany(() => Customer, {keyTo: 'parentId'})
  customers?: Customer[];

  @belongsTo(() => Customer)
  parentId?: MixedIdType;
}

export interface CustomerRelations {
  address?: AddressWithRelations;
  orders?: OrderWithRelations[];
  customers?: CustomerWithRelations[];
  parentCustomer?: CustomerWithRelations;
}

export type CustomerWithRelations = Customer & CustomerRelations;

export interface CustomerRepository
  extends EntityCrudRepository<Customer, typeof Customer.prototype.id> {
  // define additional members like relation methods here
  address: HasOneRepositoryFactory<Address, MixedIdType>;
  orders: HasManyRepositoryFactory<Order, MixedIdType>;
  customers: HasManyRepositoryFactory<Customer, MixedIdType>;
  parent: BelongsToAccessor<Customer, MixedIdType>;
}
