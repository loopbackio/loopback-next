// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {Contact, ContactRelations, Stakeholder} from '../models';

export function createContactRepo(repoClass: CrudRepositoryCtor) {
  return class ContactRepository extends repoClass<
    Contact,
    typeof Contact.prototype.id,
    ContactRelations
  > {
    public readonly stakeholder: BelongsToAccessor<
      Stakeholder,
      typeof Contact.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      stakeholderRepositoryGetter: {
        [repoType: string]: Getter<typeof repoClass.prototype>;
      },
    ) {
      super(Contact, db);
      // create a belongsto relation from this public method
      const stakeholderMeta =
        this.entityClass.definition.relations['stakeholder'];
      this.stakeholder = createBelongsToAccessor(
        stakeholderMeta as BelongsToDefinition,
        stakeholderRepositoryGetter,
        this,
      );
    }
  };
}
