// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  belongsTo,
  BelongsToAccessor,
  Entity,
  EntityCrudRepository,
  hasMany,
  HasManyThroughRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {Customer, CustomerCartItemLink, Order, OrderWithRelations} from '.';
import {MixedIdType} from '../../../../helpers.repository-tests';

@model()
export class CartItem extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @property({
    type: 'string',
  })
  description: string;

  @belongsTo(() => Order)
  orderId: MixedIdType;

  @hasMany(() => Customer, {through: {model: () => CustomerCartItemLink}})
  customers: Customer[];
}

export interface CartItemRelations {
  order?: OrderWithRelations[];
  customers?: Customer[];
}

export type CartItemWithRelations = CartItem & CartItemRelations;

export interface CartItemRepository extends EntityCrudRepository<
  CartItem,
  typeof CartItem.prototype.id
> {
  order: BelongsToAccessor<Order, MixedIdType>;
  customers: HasManyThroughRepositoryFactory<
    Customer,
    MixedIdType,
    CustomerCartItemLink,
    MixedIdType
  >;
}
