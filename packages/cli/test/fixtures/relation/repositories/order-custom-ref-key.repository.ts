import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {OrderCustomRefKey} from '../models';

export class OrderCustomRefKeyRepository extends DefaultCrudRepository<
  OrderCustomRefKey,
  typeof OrderCustomRefKey.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(OrderCustomRefKey, dataSource);
  }
}
