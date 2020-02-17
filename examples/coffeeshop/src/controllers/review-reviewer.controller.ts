import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Review, Reviewer} from '../models';
import {ReviewRepository} from '../repositories';

export class ReviewReviewerController {
  constructor(
    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
  ) {}

  @get('/reviews/{id}/reviewer', {
    responses: {
      '200': {
        description: 'Reviewer belonging to Review',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Reviewer)},
          },
        },
      },
    },
  })
  async getReviewer(
    @param.path.number('id') id: typeof Review.prototype.id,
  ): Promise<Reviewer> {
    return this.reviewRepository.reviewer(id);
  }
}
