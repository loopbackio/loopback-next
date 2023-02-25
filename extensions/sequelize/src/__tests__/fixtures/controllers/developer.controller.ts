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
import {Developer} from '../models';
import {DeveloperRepository} from '../repositories';
import {TestControllerBase} from './test.controller.base';

export class DeveloperController extends TestControllerBase {
  constructor(
    @repository(DeveloperRepository)
    public developerRepository: DeveloperRepository,
  ) {
    super(developerRepository);
  }

  @post('/developers')
  @response(200, {
    description: 'Developer model instance',
    content: {'application/json': {schema: getModelSchemaRef(Developer)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Developer, {
            title: 'NewDeveloper',
            exclude: ['id'],
          }),
        },
      },
    })
    developer: Omit<Developer, 'id'>,
  ): Promise<Developer> {
    return this.developerRepository.create(developer);
  }

  @get('/developers/count')
  @response(200, {
    description: 'Developer model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Developer) where?: Where<Developer>,
  ): Promise<Count> {
    return this.developerRepository.count(where);
  }

  @get('/developers')
  @response(200, {
    description: 'Array of Developer model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Developer, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Developer) filter?: Filter<Developer>,
  ): Promise<Developer[]> {
    return this.developerRepository.find(filter);
  }

  @patch('/developers')
  @response(200, {
    description: 'Developer PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Developer, {partial: true}),
        },
      },
    })
    developer: Developer,
    @param.where(Developer) where?: Where<Developer>,
  ): Promise<Count> {
    return this.developerRepository.updateAll(developer, where);
  }

  @get('/developers/{id}')
  @response(200, {
    description: 'Developer model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Developer, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Developer, {exclude: 'where'})
    filter?: FilterExcludingWhere<Developer>,
  ): Promise<Developer> {
    return this.developerRepository.findById(id, filter);
  }

  @patch('/developers/{id}')
  @response(204, {
    description: 'Developer PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Developer, {partial: true}),
        },
      },
    })
    developer: Developer,
  ): Promise<void> {
    await this.developerRepository.updateById(id, developer);
  }

  @put('/developers/{id}')
  @response(204, {
    description: 'Developer PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() developer: Developer,
  ): Promise<void> {
    await this.developerRepository.replaceById(id, developer);
  }

  @del('/developers/{id}')
  @response(204, {
    description: 'Developer DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.developerRepository.deleteById(id);
  }

  @get('/developers/sync-sequelize-model')
  @response(200)
  async syncSequelizeModel(): Promise<void> {
    await this.beforeEach({syncAll: true});
  }
}
