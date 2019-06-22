import {DefaultCrudRepository} from '@loopback/repository';
import {OrderClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OrderClassRepository extends DefaultCrudRepository<
  OrderClass,
  typeof OrderClass.prototype.orderNumber
> {
  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource) {
    super(OrderClass, dataSource);
  }
}
