import {DefaultCrudRepository} from '@loopback/repository';
import {CustomerClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CustomerClassRepository extends DefaultCrudRepository<
  CustomerClass,
  typeof CustomerClass.prototype.custNumber
> {
  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource) {
    super(CustomerClass, dataSource);
  }
}
