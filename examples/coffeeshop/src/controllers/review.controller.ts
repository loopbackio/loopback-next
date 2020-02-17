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
import {Review} from '../models';
import {ReviewRepository} from '../repositories';

export class ReviewController {
  constructor(
    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
  ) {}

  @post('/reviews', {
    responses: {
      '200': {
        description: 'Review model instance',
        content: {'application/json': {schema: getModelSchemaRef(Review)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {
            title: 'NewReview',
            exclude: ['id'],
          }),
        },
      },
    })
    review: Omit<Review, 'id'>,
  ): Promise<Review> {
    return this.reviewRepository.create(review);
  }

  @get('/reviews/count', {
    responses: {
      '200': {
        description: 'Review model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Review))
    where?: Where<Review>,
  ): Promise<Count> {
    return this.reviewRepository.count(where);
  }

  @get('/reviews', {
    responses: {
      '200': {
        description: 'Array of Review model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Review, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Review))
    filter?: Filter<Review>,
  ): Promise<Review[]> {
    return this.reviewRepository.find(filter);
  }

  @patch('/reviews', {
    responses: {
      '200': {
        description: 'Review PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {partial: true}),
        },
      },
    })
    review: Review,
    @param.query.object('where', getWhereSchemaFor(Review))
    where?: Where<Review>,
  ): Promise<Count> {
    return this.reviewRepository.updateAll(review, where);
  }

  @get('/reviews/{id}', {
    responses: {
      '200': {
        description: 'Review model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Review, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(Review))
    filter?: Filter<Review>,
  ): Promise<Review> {
    return this.reviewRepository.findById(id, filter);
  }

  @patch('/reviews/{id}', {
    responses: {
      '204': {
        description: 'Review PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {partial: true}),
        },
      },
    })
    review: Review,
  ): Promise<void> {
    await this.reviewRepository.updateById(id, review);
  }

  @put('/reviews/{id}', {
    responses: {
      '204': {
        description: 'Review PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() review: Review,
  ): Promise<void> {
    await this.reviewRepository.replaceById(id, review);
  }

  @del('/reviews/{id}', {
    responses: {
      '204': {
        description: 'Review DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.reviewRepository.deleteById(id);
  }
}
