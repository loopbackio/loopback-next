// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {UserLink, UserLinkRelations} from '../models';

// create the UserLinkRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createUserLinkRepo(repoClass: CrudRepositoryCtor) {
  return class UerLinkRepository extends repoClass<
    UserLink,
    typeof UserLink.prototype.id,
    UserLinkRelations
  > {
    constructor(db: juggler.DataSource) {
      super(UserLink, db);
    }
  };
}
