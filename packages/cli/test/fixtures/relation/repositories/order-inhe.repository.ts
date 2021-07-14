import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';

export class OrderInheritanceRepository extends DefaultCrudRepository<
  OrderInheritance,
  typeof OrderInheritance.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(OrderInheritance, dataSource);
  }
}
