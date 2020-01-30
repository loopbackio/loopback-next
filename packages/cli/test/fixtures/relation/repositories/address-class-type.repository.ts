import {DefaultCrudRepository} from '@loopback/repository';
import {AddressClassType} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AddressClassTypeRepository extends DefaultCrudRepository<
  AddressClassType,
  typeof AddressClassType.prototype.orderString
> {
  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource) {
    super(AddressClassType, dataSource);
  }
}
