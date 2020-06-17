// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  model,
  property,
} from '@loopback/repository';
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
}

export interface CartItemRelations {}

export type CartItemWithRelations = CartItem & CartItemRelations;

export interface CartItemRepository
  extends EntityCrudRepository<CartItem, typeof CartItem.prototype.id> {}
