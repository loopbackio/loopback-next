import {DefaultCrudRepository, BelongsToAccessor} from '@loopback/repository';
import {Order, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Order, dataSource);
  }
}
