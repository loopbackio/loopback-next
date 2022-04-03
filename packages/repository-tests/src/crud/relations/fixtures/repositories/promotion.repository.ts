// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {
  FreeDelivery,
  FreeDeliveryRelations,
  HalfPrice,
  HalfPriceRelations,
} from '../models';

export function createFreeDeliveryRepo(repoClass: CrudRepositoryCtor) {
  return class FreeDeliveryRepository extends repoClass<
    FreeDelivery,
    typeof FreeDelivery.prototype.id,
    FreeDeliveryRelations
  > {
    constructor(db: juggler.DataSource) {
      super(FreeDelivery, db);
    }
  };
}

export function createHalfPriceRepo(repoClass: CrudRepositoryCtor) {
  return class HalfPriceRepository extends repoClass<
    HalfPrice,
    typeof HalfPrice.prototype.id,
    HalfPriceRelations
  > {
    constructor(db: juggler.DataSource) {
      super(HalfPrice, db);
    }
  };
}
