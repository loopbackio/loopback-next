// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  createHasOneRepositoryFactory,
  HasOneDefinition,
  HasOneRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../../types.repository-tests';
import {Contact, Supplier, SupplierRelations} from '../models';

// create the SupplierRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createSupplierRepo(repoClass: CrudRepositoryCtor) {
  return class SupplierRepository extends repoClass<
    Supplier,
    typeof Supplier.prototype.id,
    SupplierRelations
  > {
    public readonly contact: HasOneRepositoryFactory<
      Contact,
      typeof Supplier.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      contactRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Supplier, db);
      const contactMeta = this.entityClass.definition.relations['contact'];
      this.contact = createHasOneRepositoryFactory(
        contactMeta as HasOneDefinition,
        contactRepositoryGetter,
      );
    }
  };
}
