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
import {CoffeeShop, Reviewer} from '../models';
import {CoffeeShopRepository} from '../repositories';

export class CoffeeShopReviewerController {
  constructor(
    @repository(CoffeeShopRepository)
    protected coffeeShopRepository: CoffeeShopRepository,
  ) {}

  @get('/coffee-shops/{id}/reviewers', {
    responses: {
      '200': {
        description: 'Array of CoffeeShop has many Reviewer',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Reviewer)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Reviewer>,
  ): Promise<Reviewer[]> {
    return this.coffeeShopRepository.reviewers(id).find(filter);
  }

  @post('/coffee-shops/{id}/reviewers', {
    responses: {
      '200': {
        description: 'CoffeeShop model instance',
        content: {'application/json': {schema: getModelSchemaRef(Reviewer)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof CoffeeShop.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reviewer, {
            title: 'NewReviewerInCoffeeShop',
            exclude: ['id'],
            optional: ['coffeeShopId'],
          }),
        },
      },
    })
    reviewer: Omit<Reviewer, 'id'>,
  ): Promise<Reviewer> {
    return this.coffeeShopRepository.reviewers(id).create(reviewer);
  }

  @patch('/coffee-shops/{id}/reviewers', {
    responses: {
      '200': {
        description: 'CoffeeShop.Reviewer PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reviewer, {partial: true}),
        },
      },
    })
    reviewer: Partial<Reviewer>,
    @param.query.object('where', getWhereSchemaFor(Reviewer))
    where?: Where<Reviewer>,
  ): Promise<Count> {
    return this.coffeeShopRepository.reviewers(id).patch(reviewer, where);
  }

  @del('/coffee-shops/{id}/reviewers', {
    responses: {
      '200': {
        description: 'CoffeeShop.Reviewer DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Reviewer))
    where?: Where<Reviewer>,
  ): Promise<Count> {
    return this.coffeeShopRepository.reviewers(id).delete(where);
  }
}
