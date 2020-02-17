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
import {Review, Reviewer} from '../models';
import {ReviewerRepository} from '../repositories';

export class ReviewerReviewController {
  constructor(
    @repository(ReviewerRepository)
    protected reviewerRepository: ReviewerRepository,
  ) {}

  @get('/reviewers/{id}/reviews', {
    responses: {
      '200': {
        description: 'Array of Reviewer has many Review',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Review)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Review>,
  ): Promise<Review[]> {
    return this.reviewerRepository.reviews(id).find(filter);
  }

  @post('/reviewers/{id}/reviews', {
    responses: {
      '200': {
        description: 'Reviewer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Review)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Reviewer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {
            title: 'NewReviewInReviewer',
            exclude: ['id'],
            optional: ['publisherId'],
          }),
        },
      },
    })
    review: Omit<Review, 'id'>,
  ): Promise<Review> {
    return this.reviewerRepository.reviews(id).create(review);
  }

  @patch('/reviewers/{id}/reviews', {
    responses: {
      '200': {
        description: 'Reviewer.Review PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {partial: true}),
        },
      },
    })
    review: Partial<Review>,
    @param.query.object('where', getWhereSchemaFor(Review))
    where?: Where<Review>,
  ): Promise<Count> {
    return this.reviewerRepository.reviews(id).patch(review, where);
  }

  @del('/reviewers/{id}/reviews', {
    responses: {
      '200': {
        description: 'Reviewer.Review DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Review))
    where?: Where<Review>,
  ): Promise<Count> {
    return this.reviewerRepository.reviews(id).delete(where);
  }
}
