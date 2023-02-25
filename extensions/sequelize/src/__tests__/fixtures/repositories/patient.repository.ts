import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {Patient, PatientRelations} from '../models/index';

export class PatientRepository extends SequelizeCrudRepository<
  Patient,
  typeof Patient.prototype.id,
  PatientRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Patient, dataSource);
  }
}
