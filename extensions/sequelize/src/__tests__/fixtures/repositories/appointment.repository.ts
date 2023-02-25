import {inject} from '@loopback/core';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {Appointment, AppointmentRelations} from '../models/index';

export class AppointmentRepository extends SequelizeCrudRepository<
  Appointment,
  typeof Appointment.prototype.id,
  AppointmentRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Appointment, dataSource);
  }
}
