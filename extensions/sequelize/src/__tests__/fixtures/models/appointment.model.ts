import {Entity, belongsTo, model, property} from '@loopback/repository';
import {Patient} from './patient.model';

@model()
export class Appointment extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  doctorId?: number;

  @belongsTo(
    () => Patient,
    {keyTo: 'id', name: 'patient'},
    {
      type: 'number',
    },
  )
  patientId?: number;

  constructor(data?: Partial<Appointment>) {
    super(data);
  }
}

export interface AppointmentRelations {
  // describe navigational properties here
}

export type AppointmentWithRelations = Appointment & AppointmentRelations;
