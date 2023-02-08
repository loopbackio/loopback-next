import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Employee} from '../models';

export class EmployeeRepository extends DefaultCrudRepository<
  Employee,
  typeof Employee.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Employee, dataSource);
  }
}
