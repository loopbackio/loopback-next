// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {
  createHasManyThroughRepositoryFactory,
  HasManyThroughDefinition,
  HasManyThroughRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../../types.repository-tests';
import {Customer, Order, Seller, SellerRelations} from '../models';

// create the SellerRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createSellerRepo(repoClass: CrudRepositoryCtor) {
  return class SellerRepository extends repoClass<
    Seller,
    typeof Seller.prototype.id,
    SellerRelations
  > {
    public readonly customers: HasManyThroughRepositoryFactory<
      Customer,
      typeof Customer.prototype.id,
      Order,
      typeof Seller.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      customerRepositoryGetter: Getter<typeof repoClass.prototype>,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Seller, db);
      const customersMeta = this.entityClass.definition.relations['customers'];
      this.customers = createHasManyThroughRepositoryFactory(
        customersMeta as HasManyThroughDefinition,
        customerRepositoryGetter,
        orderRepositoryGetter,
      );
    }
  };
}
