import {DefaultCrudRepository} from '@loopback/repository';
import {OrderClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class OrderClassTypeRepository extends DefaultCrudRepository<
  OrderClassType,
  typeof OrderClassType.prototype.orderString
> {
  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource) {
    super(OrderClassType, dataSource);
  }
}
