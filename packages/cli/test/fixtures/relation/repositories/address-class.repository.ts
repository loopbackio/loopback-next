import {DefaultCrudRepository} from '@loopback/repository';
import {AddressClass} from '../models';
import {MyDBDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AddressClassRepository extends DefaultCrudRepository<
  AddressClass,
  typeof AddressClass.prototype.orderNumber
> {
  constructor(@inject('datasources.myDB') dataSource: MyDBDataSource) {
    super(AddressClass, dataSource);
  }
}
