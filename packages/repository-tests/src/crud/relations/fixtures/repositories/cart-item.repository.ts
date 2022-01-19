// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasManyThroughRepositoryFactory,
  Getter,
  HasManyDefinition,
  HasManyThroughRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {
  CartItem,
  CartItemRelations,
  Customer,
  CustomerCartItemLink,
  Order,
} from '../models';

// create the CartItemRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createCartItemRepo(repoClass: CrudRepositoryCtor) {
  return class CartItemRepository extends repoClass<
    CartItem,
    typeof CartItem.prototype.id,
    CartItemRelations
  > {
    public readonly order: BelongsToAccessor<
      Order,
      typeof CartItem.prototype.id
    >;

    public readonly customers: HasManyThroughRepositoryFactory<
      Customer,
      typeof Customer.prototype.id,
      CustomerCartItemLink,
      typeof CustomerCartItemLink.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
      customerRepositoryGetter: Getter<typeof repoClass.prototype>,
      customerCartItemLinkRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(CartItem, db);
      const ordersMeta = this.entityClass.definition.relations['order'];
      this.order = createBelongsToAccessor(
        ordersMeta as BelongsToDefinition,
        orderRepositoryGetter,
        this,
      );

      const customersMeta = this.entityClass.definition.relations['customers'];
      this.customers = createHasManyThroughRepositoryFactory(
        customersMeta as HasManyDefinition,
        customerRepositoryGetter,
        customerCartItemLinkRepositoryGetter,
      );
    }
  };
}
