import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Patient} from '../models';
import {PatientRepository} from '../repositories';

export class PatientController {
  constructor(
    @repository(PatientRepository)
    public patientRepository: PatientRepository,
  ) {}

  @post('/patients')
  @response(200, {
    description: 'Patient model instance',
    content: {'application/json': {schema: getModelSchemaRef(Patient)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {
            title: 'NewPatient',
            exclude: ['id'],
          }),
        },
      },
    })
    patient: Omit<Patient, 'id'>,
  ): Promise<Patient> {
    return this.patientRepository.create(patient);
  }

  @get('/patients/count')
  @response(200, {
    description: 'Patient model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Patient) where?: Where<Patient>): Promise<Count> {
    return this.patientRepository.count(where);
  }

  @get('/patients')
  @response(200, {
    description: 'Array of Patient model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Patient, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Patient) filter?: Filter<Patient>,
  ): Promise<Patient[]> {
    return this.patientRepository.find(filter);
  }

  @patch('/patients')
  @response(200, {
    description: 'Patient PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {partial: true}),
        },
      },
    })
    patient: Patient,
    @param.where(Patient) where?: Where<Patient>,
  ): Promise<Count> {
    return this.patientRepository.updateAll(patient, where);
  }

  @get('/patients/{id}')
  @response(200, {
    description: 'Patient model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Patient, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Patient, {exclude: 'where'})
    filter?: FilterExcludingWhere<Patient>,
  ): Promise<Patient> {
    return this.patientRepository.findById(id, filter);
  }

  @patch('/patients/{id}')
  @response(204, {
    description: 'Patient PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Patient, {partial: true}),
        },
      },
    })
    patient: Patient,
  ): Promise<void> {
    await this.patientRepository.updateById(id, patient);
  }

  @put('/patients/{id}')
  @response(204, {
    description: 'Patient PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() patient: Patient,
  ): Promise<void> {
    await this.patientRepository.replaceById(id, patient);
  }

  @del('/patients/{id}')
  @response(204, {
    description: 'Patient DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.patientRepository.deleteById(id);
  }
}
