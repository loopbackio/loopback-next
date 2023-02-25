import {Getter, inject} from '@loopback/core';
import {
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {Appointment, Doctor, DoctorRelations, Patient} from '../models/index';
import {AppointmentRepository} from './appointment.repository';
import {PatientRepository} from './patient.repository';

export class DoctorRepository extends SequelizeCrudRepository<
  Doctor,
  typeof Doctor.prototype.id,
  DoctorRelations
> {
  public readonly patients: HasManyThroughRepositoryFactory<
    Patient,
    typeof Patient.prototype.id,
    Appointment,
    typeof Doctor.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('AppointmentRepository')
    protected appointmentRepositoryGetter: Getter<AppointmentRepository>,
    @repository.getter('PatientRepository')
    protected patientRepositoryGetter: Getter<PatientRepository>,
  ) {
    super(Doctor, dataSource);
    this.patients = this.createHasManyThroughRepositoryFactoryFor(
      'patients',
      patientRepositoryGetter,
      appointmentRepositoryGetter,
    );
    this.registerInclusionResolver('patients', this.patients.inclusionResolver);
  }
}
