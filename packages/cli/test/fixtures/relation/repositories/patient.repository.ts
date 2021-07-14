import {DefaultCrudRepository} from '@loopback/repository';
import {Patient} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PatientRepository extends DefaultCrudRepository<
  Patient,
  typeof Patient.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Patient, dataSource);
  }
}
