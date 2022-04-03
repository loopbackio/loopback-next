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
export class CustomerPromotionLink extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @property()
  customerId: MixedIdType;

  @property()
  // eslint-disable-next-line @typescript-eslint/naming-convention
  promotion_id: MixedIdType;

  @property({
    type: 'string',
    default: 'HalfPrice',
    required: true,
  })
  promotiontype: string;

  @property({
    type: 'string',
  })
  description?: string;
}

export interface CustomerPromotionLinkRelations {}

export type CustomerPromotionLinkWithRelations = CustomerPromotionLink &
  CustomerPromotionLinkRelations;

export interface CustomerPromotionLinkRepository
  extends EntityCrudRepository<
    CustomerPromotionLink,
    typeof CustomerPromotionLink.prototype.id
  > {}
