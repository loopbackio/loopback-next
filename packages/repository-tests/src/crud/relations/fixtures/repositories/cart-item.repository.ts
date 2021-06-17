// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  Getter,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {CartItem, CartItemRelations, Order} from '../models';

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
    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(CartItem, db);
      const ordersMeta = this.entityClass.definition.relations['order'];
      this.order = createBelongsToAccessor(
        ordersMeta as BelongsToDefinition,
        orderRepositoryGetter,
        this,
      );
    }
  };
}
