// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
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
export class CustomerCartItemLink extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @property()
  customerId: MixedIdType;

  @property()
  cartItemId: MixedIdType;

  @property({
    type: 'string',
  })
  description?: string;
}

export interface CustomerCartItemLinkRelations {}

export type CustomerCartItemLinkWithRelations = CustomerCartItemLink &
  CustomerCartItemLinkRelations;

export interface CustomerCartItemLinkRepository
  extends EntityCrudRepository<
    CustomerCartItemLink,
    typeof CustomerCartItemLink.prototype.id
  > {}
