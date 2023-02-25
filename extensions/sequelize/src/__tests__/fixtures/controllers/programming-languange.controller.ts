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
import {ProgrammingLanguage} from '../models';
import {ProgrammingLanguageRepository} from '../repositories';

export class ProgrammingLanguangeController {
  constructor(
    @repository(ProgrammingLanguageRepository)
    public programmingLanguageRepository: ProgrammingLanguageRepository,
  ) {}

  @post('/programming-languages')
  @response(200, {
    description: 'ProgrammingLanguage model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(ProgrammingLanguage)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProgrammingLanguage, {
            title: 'NewProgrammingLanguage',
            exclude: ['id'],
          }),
        },
      },
    })
    programmingLanguage: Omit<ProgrammingLanguage, 'id'>,
  ): Promise<ProgrammingLanguage> {
    return this.programmingLanguageRepository.create(programmingLanguage);
  }

  @post('/programming-languages-bulk')
  @response(200, {
    description: 'ProgrammingLanguage model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ProgrammingLanguage),
        },
      },
    },
  })
  async createAll(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(ProgrammingLanguage, {
              title: 'NewProgrammingLanguage',
              exclude: ['id'],
            }),
          },
        },
      },
    })
    programmingLanguages: Array<Omit<ProgrammingLanguage, 'id'>>,
  ): Promise<ProgrammingLanguage[]> {
    return this.programmingLanguageRepository.createAll(programmingLanguages);
  }

  @get('/programming-languages/count')
  @response(200, {
    description: 'ProgrammingLanguage model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ProgrammingLanguage) where?: Where<ProgrammingLanguage>,
  ): Promise<Count> {
    return this.programmingLanguageRepository.count(where);
  }

  @get('/programming-languages')
  @response(200, {
    description: 'Array of ProgrammingLanguage model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ProgrammingLanguage, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(ProgrammingLanguage) filter?: Filter<ProgrammingLanguage>,
  ): Promise<ProgrammingLanguage[]> {
    return this.programmingLanguageRepository.find(filter);
  }

  @patch('/programming-languages')
  @response(200, {
    description: 'ProgrammingLanguage PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProgrammingLanguage, {partial: true}),
        },
      },
    })
    programmingLanguage: ProgrammingLanguage,
    @param.where(ProgrammingLanguage) where?: Where<ProgrammingLanguage>,
  ): Promise<Count> {
    return this.programmingLanguageRepository.updateAll(
      programmingLanguage,
      where,
    );
  }

  @get('/programming-languages/{id}')
  @response(200, {
    description: 'ProgrammingLanguage model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ProgrammingLanguage, {
          includeRelations: true,
        }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ProgrammingLanguage, {exclude: 'where'})
    filter?: FilterExcludingWhere<ProgrammingLanguage>,
  ): Promise<ProgrammingLanguage> {
    return this.programmingLanguageRepository.findById(id, filter);
  }

  @patch('/programming-languages/{id}')
  @response(204, {
    description: 'ProgrammingLanguage PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProgrammingLanguage, {partial: true}),
        },
      },
    })
    programmingLanguage: ProgrammingLanguage,
  ): Promise<void> {
    await this.programmingLanguageRepository.updateById(
      id,
      programmingLanguage,
    );
  }

  @put('/programming-languages/{id}')
  @response(204, {
    description: 'ProgrammingLanguage PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() programmingLanguage: ProgrammingLanguage,
  ): Promise<void> {
    await this.programmingLanguageRepository.replaceById(
      id,
      programmingLanguage,
    );
  }

  @del('/programming-languages/{id}')
  @response(204, {
    description: 'ProgrammingLanguage DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.programmingLanguageRepository.deleteById(id);
  }
}
