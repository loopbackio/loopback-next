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
export class UserLink extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @property()
  followerId: MixedIdType;

  @property()
  followeeId: MixedIdType;

  @property({
    type: 'string',
  })
  description?: string;
}

export interface UserLinkRelations {}

export type UserLinkWithRelations = UserLink & UserLinkRelations;

export interface UserLinkRepository
  extends EntityCrudRepository<UserLink, typeof UserLink.prototype.id> {}
