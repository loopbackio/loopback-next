import {DefaultCrudRepository} from '@loopback/repository';
import {Order} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Order, dataSource);
  }
}
