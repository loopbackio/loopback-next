import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Patient, PatientRelations} from '../models/index';

export class PatientRepository extends SequelizeCrudRepository<
  Patient,
  typeof Patient.prototype.id,
  PatientRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(Patient, dataSource);
  }
}
