import {DefaultCrudRepository} from '@loopback/repository';
import {Doctor} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DoctorRepository extends DefaultCrudRepository<
  Doctor,
  typeof Doctor.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Doctor, dataSource);
  }
}
