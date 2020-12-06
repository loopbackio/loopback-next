// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {CartItem, CartItemRelations} from '../models';

// create the CartItemRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createCartItemRepo(repoClass: CrudRepositoryCtor) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return class CartItemRepository extends repoClass<
    CartItem,
    typeof CartItem.prototype.id,
    CartItemRelations
  > {
    constructor(db: juggler.DataSource) {
      super(CartItem, db);
    }
  };
}
