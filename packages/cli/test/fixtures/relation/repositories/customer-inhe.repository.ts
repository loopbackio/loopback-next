import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {CustomerInheritance} from '../models';

export class CustomerInheritanceRepository extends DefaultCrudRepository<
  CustomerInheritance,
  typeof CustomerInheritance.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(CustomerInheritance, dataSource);
  }
}
