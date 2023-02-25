import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Doctor} from '../models';
import {DoctorRepository} from '../repositories';
import {TestControllerBase} from './test.controller.base';

export class DoctorController extends TestControllerBase {
  constructor(
    @repository(DoctorRepository)
    public doctorRepository: DoctorRepository,
  ) {
    super(doctorRepository);
  }

  @post('/doctors')
  @response(200, {
    description: 'Doctor model instance',
    content: {'application/json': {schema: getModelSchemaRef(Doctor)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doctor, {
            title: 'NewDoctor',
            exclude: ['id'],
          }),
        },
      },
    })
    doctor: Omit<Doctor, 'id'>,
  ): Promise<Doctor> {
    return this.doctorRepository.create(doctor);
  }

  @get('/doctors/count')
  @response(200, {
    description: 'Doctor model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Doctor) where?: Where<Doctor>): Promise<Count> {
    return this.doctorRepository.count(where);
  }

  @get('/doctors')
  @response(200, {
    description: 'Array of Doctor model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Doctor, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Doctor) filter?: Filter<Doctor>): Promise<Doctor[]> {
    return this.doctorRepository.find(filter);
  }

  @patch('/doctors')
  @response(200, {
    description: 'Doctor PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doctor, {partial: true}),
        },
      },
    })
    doctor: Doctor,
    @param.where(Doctor) where?: Where<Doctor>,
  ): Promise<Count> {
    return this.doctorRepository.updateAll(doctor, where);
  }

  @get('/doctors/{id}')
  @response(200, {
    description: 'Doctor model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Doctor, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Doctor, {exclude: 'where'})
    filter?: FilterExcludingWhere<Doctor>,
  ): Promise<Doctor> {
    return this.doctorRepository.findById(id, filter);
  }

  @patch('/doctors/{id}')
  @response(204, {
    description: 'Doctor PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doctor, {partial: true}),
        },
      },
    })
    doctor: Doctor,
  ): Promise<void> {
    await this.doctorRepository.updateById(id, doctor);
  }

  @put('/doctors/{id}')
  @response(204, {
    description: 'Doctor PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() doctor: Doctor,
  ): Promise<void> {
    await this.doctorRepository.replaceById(id, doctor);
  }

  @del('/doctors/{id}')
  @response(204, {
    description: 'Doctor DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.doctorRepository.deleteById(id);
  }

  @get('/doctors/sync-sequelize-model')
  @response(200)
  async syncSequelizeModel(): Promise<void> {
    await this.beforeEach({syncAll: true});
  }
}
