// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  createHasManyThroughRepositoryFactory,
  HasManyDefinition,
  HasManyThroughRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../../types.repository-tests';
import {User, UserLink, UserRelations} from '../models';

// create the UserRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createUserRepo(repoClass: CrudRepositoryCtor) {
  return class UserRepository extends repoClass<
    User,
    typeof User.prototype.id,
    UserRelations
  > {
    public readonly users: HasManyThroughRepositoryFactory<
      User,
      typeof User.prototype.id,
      UserLink,
      typeof UserLink.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      userLinkRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(User, db);
      const usersMeta = this.entityClass.definition.relations['users'];
      this.users = createHasManyThroughRepositoryFactory(
        usersMeta as HasManyDefinition,
        Getter.fromValue(this),
        userLinkRepositoryGetter,
      );
    }
  };
}
