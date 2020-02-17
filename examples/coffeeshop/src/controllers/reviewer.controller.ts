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
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {Reviewer} from '../models';
import {ReviewerRepository} from '../repositories';

export class ReviewerController {
  constructor(
    @repository(ReviewerRepository)
    public reviewerRepository: ReviewerRepository,
  ) {}

  @post('/reviewers', {
    responses: {
      '200': {
        description: 'Reviewer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Reviewer)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reviewer, {
            title: 'NewReviewer',
            exclude: ['id'],
          }),
        },
      },
    })
    reviewer: Omit<Reviewer, 'id'>,
  ): Promise<Reviewer> {
    return this.reviewerRepository.create(reviewer);
  }

  @get('/reviewers/count', {
    responses: {
      '200': {
        description: 'Reviewer model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Reviewer))
    where?: Where<Reviewer>,
  ): Promise<Count> {
    return this.reviewerRepository.count(where);
  }

  @get('/reviewers', {
    responses: {
      '200': {
        description: 'Array of Reviewer model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Reviewer, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Reviewer))
    filter?: Filter<Reviewer>,
  ): Promise<Reviewer[]> {
    return this.reviewerRepository.find(filter);
  }

  @patch('/reviewers', {
    responses: {
      '200': {
        description: 'Reviewer PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reviewer, {partial: true}),
        },
      },
    })
    reviewer: Reviewer,
    @param.query.object('where', getWhereSchemaFor(Reviewer))
    where?: Where<Reviewer>,
  ): Promise<Count> {
    return this.reviewerRepository.updateAll(reviewer, where);
  }

  @get('/reviewers/{id}', {
    responses: {
      '200': {
        description: 'Reviewer model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Reviewer, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Reviewer))
    filter?: Filter<Reviewer>,
  ): Promise<Reviewer> {
    return this.reviewerRepository.findById(id, filter);
  }

  @patch('/reviewers/{id}', {
    responses: {
      '204': {
        description: 'Reviewer PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reviewer, {partial: true}),
        },
      },
    })
    reviewer: Reviewer,
  ): Promise<void> {
    await this.reviewerRepository.updateById(id, reviewer);
  }

  @put('/reviewers/{id}', {
    responses: {
      '204': {
        description: 'Reviewer PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() reviewer: Reviewer,
  ): Promise<void> {
    await this.reviewerRepository.replaceById(id, reviewer);
  }

  @del('/reviewers/{id}', {
    responses: {
      '204': {
        description: 'Reviewer DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.reviewerRepository.deleteById(id);
  }
}
