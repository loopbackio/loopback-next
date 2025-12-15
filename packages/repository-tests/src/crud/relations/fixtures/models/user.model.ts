// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  hasMany,
  HasManyThroughRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {MixedIdType} from '../../../../helpers.repository-tests';
import {UserLink} from './user-link.model';

@model()
export class User extends Entity {
  @property({
    id: true,
    generated: true,
    useDefaultIdType: true,
  })
  id: MixedIdType;

  @property({
    type: 'string',
  })
  name: string;

  @hasMany(() => User, {
    through: {
      model: () => UserLink,
      keyFrom: 'followerId',
      keyTo: 'followeeId',
    },
  })
  users: User[];
}

export interface UserRelations {
  users?: UserWithRelations;
}

export type UserWithRelations = User & UserRelations;

export interface UserRepository extends EntityCrudRepository<
  User,
  typeof User.prototype.id
> {
  // define additional members like relation methods here
  users: HasManyThroughRepositoryFactory<
    User,
    MixedIdType,
    UserLink,
    MixedIdType
  >;
}
