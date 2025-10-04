// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 discover integration generates all models without prompts using --all --datasource 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Schema extends Entity {
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Schema>) {
    super(data);
  }
}

export interface SchemaRelations {
  // describe navigational properties here
}

export type SchemaWithRelations = Schema & SchemaRelations;

`;


exports[`lb4 discover integration generates all models without prompts using --all --datasource 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class View extends Entity {
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<View>) {
    super(data);
  }
}

export interface ViewRelations {
  // describe navigational properties here
}

export type ViewWithRelations = View & ViewRelations;

`;


exports[`lb4 discover integration model discovery discovers models with --relations 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Appointment,
  Doctor,
} from '../models';
import {AppointmentRepository} from '../repositories';

export class AppointmentDoctorController {
  constructor(
    @repository(AppointmentRepository)
    public appointmentRepository: AppointmentRepository,
  ) { }

  @get('/appointments/{id}/doctor', {
    responses: {
      '200': {
        description: 'Doctor belonging to Appointment',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Doctor),
          },
        },
      },
    },
  })
  async getDoctor(
    @param.path.number('id') id: typeof Appointment.prototype.id,
  ): Promise<Doctor> {
    return this.appointmentRepository.doctor(id);
  }
}

`;


exports[`lb4 discover integration model discovery discovers models with --relations 2`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Appointment,
  Patient,
} from '../models';
import {AppointmentRepository} from '../repositories';

export class AppointmentPatientController {
  constructor(
    @repository(AppointmentRepository)
    public appointmentRepository: AppointmentRepository,
  ) { }

  @get('/appointments/{id}/patient', {
    responses: {
      '200': {
        description: 'Patient belonging to Appointment',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Patient),
          },
        },
      },
    },
  })
  async getPatient(
    @param.path.number('id') id: typeof Appointment.prototype.id,
  ): Promise<Patient> {
    return this.appointmentRepository.patient(id);
  }
}

`;


exports[`lb4 discover integration model discovery discovers models with --relations 3`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Doctor,
} from '../models';
import {DoctorRepository} from '../repositories';

export class DoctorDoctorController {
  constructor(
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
  ) { }

  @get('/doctors/{id}/doctor', {
    responses: {
      '200': {
        description: 'Doctor belonging to Doctor',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Doctor),
          },
        },
      },
    },
  })
  async getDoctor(
    @param.path.number('id') id: typeof Doctor.prototype.id,
  ): Promise<Doctor> {
    return this.doctorRepository.reportsTo(id);
  }
}

`;


exports[`lb4 discover integration model discovery discovers models with --relations 4`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';

@model()
export class Doctor extends Entity {
  @property({
    type: 'number',
    scale: 0,
    id: 1,
  })
  id?: number;

  @property({
    type: 'string',
    length: 45,
  })
  name?: string;

  @belongsTo(() => Doctor)
  reportsTo: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Doctor>) {
    super(data);
  }
}

export interface DoctorRelations {
  // describe navigational properties here
}

export type DoctorWithRelations = Doctor & DoctorRelations;

`;


exports[`lb4 discover integration model discovery does not mark id property as required based on optionalId option 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Test extends Entity {
  @property({
    type: 'date',
  })
  dateTest?: string;

  @property({
    type: 'number',
  })
  numberTest?: number;

  @property({
    type: 'string',
  })
  stringTest?: string;

  @property({
    type: 'boolean',
  })
  booleanText?: boolean;

  @property({
    type: 'number',
    scale: 0,
    id: 1,
  })
  id?: number;

  @property({
    type: 'boolean',
  })
  isActive?: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Test>) {
    super(data);
  }
}

export interface TestRelations {
  // describe navigational properties here
}

export type TestWithRelations = Test & TestRelations;

`;


exports[`lb4 discover integration model discovery generate relations with --relations 1`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Appointment,
  Doctor,
} from '../models';
import {AppointmentRepository} from '../repositories';

export class AppointmentDoctorController {
  constructor(
    @repository(AppointmentRepository)
    public appointmentRepository: AppointmentRepository,
  ) { }

  @get('/appointments/{id}/doctor', {
    responses: {
      '200': {
        description: 'Doctor belonging to Appointment',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Doctor),
          },
        },
      },
    },
  })
  async getDoctor(
    @param.path.number('id') id: typeof Appointment.prototype.id,
  ): Promise<Doctor> {
    return this.appointmentRepository.doctor(id);
  }
}

`;


exports[`lb4 discover integration model discovery generate relations with --relations 2`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Appointment,
  Patient,
} from '../models';
import {AppointmentRepository} from '../repositories';

export class AppointmentPatientController {
  constructor(
    @repository(AppointmentRepository)
    public appointmentRepository: AppointmentRepository,
  ) { }

  @get('/appointments/{id}/patient', {
    responses: {
      '200': {
        description: 'Patient belonging to Appointment',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Patient),
          },
        },
      },
    },
  })
  async getPatient(
    @param.path.number('id') id: typeof Appointment.prototype.id,
  ): Promise<Patient> {
    return this.appointmentRepository.patient(id);
  }
}

`;


exports[`lb4 discover integration model discovery generate relations with --relations 3`] = `
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Doctor,
} from '../models';
import {DoctorRepository} from '../repositories';

export class DoctorDoctorController {
  constructor(
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
  ) { }

  @get('/doctors/{id}/doctor', {
    responses: {
      '200': {
        description: 'Doctor belonging to Doctor',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Doctor),
          },
        },
      },
    },
  })
  async getDoctor(
    @param.path.number('id') id: typeof Doctor.prototype.id,
  ): Promise<Doctor> {
    return this.doctorRepository.reportsTo(id);
  }
}

`;


exports[`lb4 discover integration model discovery generate relations with --relations 4`] = `
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Doctor} from './doctor.model';
import {Patient} from './patient.model';

@model()
export class Appointment extends Entity {
  @property({
    type: 'number',
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mysql: {columnName: 'id', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'N', generated: 1},
  })
  id?: number;
  @belongsTo(() => Doctor)
  doctorId: number;

  @belongsTo(() => Patient)
  patientId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Appointment>) {
    super(data);
  }
}

export interface AppointmentRelations {
  // describe navigational properties here
}

export type AppointmentWithRelations = Appointment & AppointmentRelations;

`;


exports[`lb4 discover integration model discovery generates all models without prompts using --all --dataSource 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Schema extends Entity {
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Schema>) {
    super(data);
  }
}

export interface SchemaRelations {
  // describe navigational properties here
}

export type SchemaWithRelations = Schema & SchemaRelations;

`;


exports[`lb4 discover integration model discovery generates all models without prompts using --all --dataSource 2`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class View extends Entity {
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<View>) {
    super(data);
  }
}

export interface ViewRelations {
  // describe navigational properties here
}

export type ViewWithRelations = View & ViewRelations;

`;


exports[`lb4 discover integration model discovery keeps model property names the same as the db column names 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Naming extends Entity {
  @property({
    type: 'number',
    id: 1,
    required: true,
  })
  ID: number;

  @property({
    type: 'number',
  })
  snake_case?: number;

  @property({
    type: 'boolean',
  })
  lowercase?: boolean;

  @property({
    type: 'number',
  })
  camelCase?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Naming>) {
    super(data);
  }
}

export interface NamingRelations {
  // describe navigational properties here
}

export type NamingWithRelations = Naming & NamingRelations;

`;


exports[`lb4 discover integration model discovery treatTINYINT1AsTinyInt set to false to treat tinyint(1) as boolean 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Test extends Entity {
  @property({
    type: 'date',
  })
  dateTest?: string;

  @property({
    type: 'number',
  })
  numberTest?: number;

  @property({
    type: 'string',
  })
  stringTest?: string;

  @property({
    type: 'boolean',
  })
  booleanText?: boolean;

  @property({
    type: 'number',
    scale: 0,
    id: 1,
  })
  id?: number;

  @property({
    type: 'boolean',
  })
  isActive?: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Test>) {
    super(data);
  }
}

export interface TestRelations {
  // describe navigational properties here
}

export type TestWithRelations = Test & TestRelations;

`;


exports[`lb4 discover integration model discovery uses a different --outDir if provided 1`] = `
import {Entity, model, property} from '@loopback/repository';

@model()
export class Test extends Entity {
  @property({
    type: 'date',
  })
  dateTest?: string;

  @property({
    type: 'number',
  })
  numberTest?: number;

  @property({
    type: 'string',
  })
  stringTest?: string;

  @property({
    type: 'boolean',
  })
  booleanText?: boolean;

  @property({
    type: 'number',
    scale: 0,
    id: 1,
  })
  id?: number;

  @property({
    type: 'boolean',
  })
  isActive?: boolean;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Test>) {
    super(data);
  }
}

export interface TestRelations {
  // describe navigational properties here
}

export type TestWithRelations = Test & TestRelations;

`;
