// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DsDataSource} from '../datasources';
import {CoffeeShop, CoffeeShopRelations} from '../models';

export class CoffeeShopRepository extends DefaultCrudRepository<
  CoffeeShop,
  typeof CoffeeShop.prototype.shopId,
  CoffeeShopRelations
> {
  constructor(@inject('datasources.ds') dataSource: DsDataSource) {
    super(CoffeeShop, dataSource);
  }
}
