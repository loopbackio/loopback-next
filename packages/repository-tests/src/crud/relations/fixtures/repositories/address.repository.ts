// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
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
import {Address, AddressRelations, Customer} from '../models';

export function createAddressRepo(repoClass: CrudRepositoryCtor) {
  return class AddressRepository extends repoClass<
    Address,
    typeof Address.prototype.id,
    AddressRelations
  > {
    public readonly customer: BelongsToAccessor<
      Customer,
      typeof Address.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      customerRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Address, db);
      // create a belongsto relation from this public method
      const customerMeta = this.entityClass.definition.relations['customer'];
      this.customer = createBelongsToAccessor(
        customerMeta as BelongsToDefinition,
        customerRepositoryGetter,
        this,
      );
    }
  };
}
