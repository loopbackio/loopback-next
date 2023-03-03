import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Appointment, AppointmentRelations} from '../models/index';

export class AppointmentRepository extends SequelizeCrudRepository<
  Appointment,
  typeof Appointment.prototype.id,
  AppointmentRelations
> {
  constructor(@inject('datasources.primary') dataSource: PrimaryDataSource) {
    super(Appointment, dataSource);
  }
}
