import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {CoffeeShop, CoffeeShopRelations} from '../models';

export class CoffeeShopRepository extends DefaultCrudRepository<
  CoffeeShop,
  typeof CoffeeShop.prototype.id,
  CoffeeShopRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(CoffeeShop, dataSource);
  }
}
