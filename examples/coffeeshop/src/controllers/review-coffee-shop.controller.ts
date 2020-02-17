import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {CoffeeShop, Review} from '../models';
import {ReviewRepository} from '../repositories';

export class ReviewCoffeeShopController {
  constructor(
    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
  ) {}

  @get('/reviews/{id}/coffee-shop', {
    responses: {
      '200': {
        description: 'CoffeeShop belonging to Review',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CoffeeShop)},
          },
        },
      },
    },
  })
  async getCoffeeShop(
    @param.path.number('id') id: typeof Review.prototype.id,
  ): Promise<CoffeeShop> {
    return this.reviewRepository.coffeeShop(id);
  }
}
