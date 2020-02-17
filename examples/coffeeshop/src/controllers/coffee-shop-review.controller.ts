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
import {CoffeeShop, Review} from '../models';
import {CoffeeShopRepository} from '../repositories';

export class CoffeeShopReviewController {
  constructor(
    @repository(CoffeeShopRepository)
    protected coffeeShopRepository: CoffeeShopRepository,
  ) {}

  @get('/coffee-shops/{id}/reviews', {
    responses: {
      '200': {
        description: 'Array of CoffeeShop has many Review',
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
    return this.coffeeShopRepository.reviews(id).find(filter);
  }

  @post('/coffee-shops/{id}/reviews', {
    responses: {
      '200': {
        description: 'CoffeeShop model instance',
        content: {'application/json': {schema: getModelSchemaRef(Review)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CoffeeShop.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Review, {
            title: 'NewReviewInCoffeeShop',
            exclude: ['id'],
            optional: ['coffeeShopId'],
          }),
        },
      },
    })
    review: Omit<Review, 'id'>,
  ): Promise<Review> {
    return this.coffeeShopRepository.reviews(id).create(review);
  }

  @patch('/coffee-shops/{id}/reviews', {
    responses: {
      '200': {
        description: 'CoffeeShop.Review PATCH success count',
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
    return this.coffeeShopRepository.reviews(id).patch(review, where);
  }

  @del('/coffee-shops/{id}/reviews', {
    responses: {
      '200': {
        description: 'CoffeeShop.Review DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Review))
    where?: Where<Review>,
  ): Promise<Count> {
    return this.coffeeShopRepository.reviews(id).delete(where);
  }
}
