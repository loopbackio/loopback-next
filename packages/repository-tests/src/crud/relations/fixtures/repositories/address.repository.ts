// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {
  BelongsToAccessor,
  juggler,
  createBelongsToAccessor,
  BelongsToDefinition,
} from '@loopback/repository';
import {Address, AddressRelations, Customer} from '../models';
import {CrudRepositoryCtor} from '../../../..';

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
