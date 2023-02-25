import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Doctor, Patient} from '../models';
import {DoctorRepository} from '../repositories';

export class DoctorPatientController {
  constructor(
    @repository(DoctorRepository) protected doctorRepository: DoctorRepository,
  ) {}

  @get('/doctors/{id}/patients', {
    responses: {
      '200': {
        description: 'Array of Doctor has many Patient through Appointment',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Patient)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Patient>,
  ): Promise<Patient[]> {
    return this.doctorRepository.patients(id).find(filter);
  }

  @post('/doctors/{id}/patients', {
    responses: {
      '200': {
        description: 'create a Patient model instance',
        content: {'application/json': {schema: getModelSchemaRef(Patient)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Doctor.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {
            title: 'NewPatientInDoctor',
            exclude: ['id'],
          }),
        },
      },
    })
    patient: Omit<Patient, 'id'>,
  ): Promise<Patient> {
    return this.doctorRepository.patients(id).create(patient);
  }

  @patch('/doctors/{id}/patients', {
    responses: {
      '200': {
        description: 'Doctor.Patient PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {partial: true}),
        },
      },
    })
    patient: Partial<Patient>,
    @param.query.object('where', getWhereSchemaFor(Patient))
    where?: Where<Patient>,
  ): Promise<Count> {
    return this.doctorRepository.patients(id).patch(patient, where);
  }

  @del('/doctors/{id}/patients', {
    responses: {
      '200': {
        description: 'Doctor.Patient DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Patient))
    where?: Where<Patient>,
  ): Promise<Count> {
    return this.doctorRepository.patients(id).delete(where);
  }
}
