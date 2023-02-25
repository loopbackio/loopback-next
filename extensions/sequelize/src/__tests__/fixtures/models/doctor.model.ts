import {Entity, hasMany, model, property} from '@loopback/repository';
import {Appointment} from './appointment.model';
import {Patient} from './patient.model';

@model()
export class Doctor extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @hasMany(() => Patient, {
    through: {
      model: () => Appointment,
      keyFrom: 'doctorId',
      keyTo: 'patientId',
    },
  })
  patients: Patient[];

  constructor(data?: Partial<Doctor>) {
    super(data);
  }
}

export interface DoctorRelations {
  // describe navigational properties here
}

export type DoctorWithRelations = Doctor & DoctorRelations;
