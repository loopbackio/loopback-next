import {DefaultCrudRepository} from '@loopback/repository';
import {CustomerClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CustomerClassTypeRepository extends DefaultCrudRepository<
  CustomerClassType,
  typeof CustomerClassType.prototype.custNumber
> {
  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource) {
    super(CustomerClassType, dataSource);
  }
}
