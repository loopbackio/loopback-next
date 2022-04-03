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
export class Promotion extends Entity {
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

export interface PromotionRelations {}

export type PromotionWithRelations = Promotion & PromotionRelations;

export interface PromotionRepository
  extends EntityCrudRepository<Promotion, typeof Promotion.prototype.id> {}

@model()
export class FreeDelivery extends Promotion {
  @property({
    type: 'string',
  })
  name: string;
}

export interface FreeDeliveryRelations {}

export type FreeDeliveryWithRelations = FreeDelivery & FreeDeliveryRelations;

export interface FreeDeliveryRepository
  extends EntityCrudRepository<
    FreeDelivery,
    typeof FreeDelivery.prototype.id
  > {}

@model()
export class HalfPrice extends Promotion {
  @property({
    type: 'string',
  })
  name: string;
}

export interface HalfPriceRelations {}

export type HalfPriceWithRelations = HalfPrice & HalfPriceRelations;

export interface HalfPriceRepository
  extends EntityCrudRepository<HalfPrice, typeof HalfPrice.prototype.id> {}
