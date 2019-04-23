import {DefaultCrudRepository} from '@loopback/repository';
import {Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Customer, dataSource);
  }
}
