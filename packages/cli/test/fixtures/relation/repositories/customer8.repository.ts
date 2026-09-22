import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Customer8} from '../models';

export class Customer8Repository extends DefaultCrudRepository<
  Customer8,
  typeof Customer8.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Customer8, dataSource);
  }
}
