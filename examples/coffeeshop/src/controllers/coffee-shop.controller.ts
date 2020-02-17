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
import {CoffeeShop} from '../models';
import {CoffeeShopRepository} from '../repositories';

export class CoffeeShopController {
  constructor(
    @repository(CoffeeShopRepository)
    public coffeeShopRepository: CoffeeShopRepository,
  ) {}

  @post('/coffee-shops', {
    responses: {
      '200': {
        description: 'CoffeeShop model instance',
        content: {'application/json': {schema: getModelSchemaRef(CoffeeShop)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CoffeeShop, {
            title: 'NewCoffeeShop',
            exclude: ['id'],
          }),
        },
      },
    })
    coffeeShop: Omit<CoffeeShop, 'id'>,
  ): Promise<CoffeeShop> {
    return this.coffeeShopRepository.create(coffeeShop);
  }

  @get('/coffee-shops/count', {
    responses: {
      '200': {
        description: 'CoffeeShop model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(CoffeeShop))
    where?: Where<CoffeeShop>,
  ): Promise<Count> {
    return this.coffeeShopRepository.count(where);
  }

  @get('/coffee-shops', {
    responses: {
      '200': {
        description: 'Array of CoffeeShop model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(CoffeeShop, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(CoffeeShop))
    filter?: Filter<CoffeeShop>,
  ): Promise<CoffeeShop[]> {
    return this.coffeeShopRepository.find(filter);
  }

  @patch('/coffee-shops', {
    responses: {
      '200': {
        description: 'CoffeeShop PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CoffeeShop, {partial: true}),
        },
      },
    })
    coffeeShop: CoffeeShop,
    @param.query.object('where', getWhereSchemaFor(CoffeeShop))
    where?: Where<CoffeeShop>,
  ): Promise<Count> {
    return this.coffeeShopRepository.updateAll(coffeeShop, where);
  }

  @get('/coffee-shops/{id}', {
    responses: {
      '200': {
        description: 'CoffeeShop model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CoffeeShop, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.query.object('filter', getFilterSchemaFor(CoffeeShop))
    filter?: Filter<CoffeeShop>,
  ): Promise<CoffeeShop> {
    return this.coffeeShopRepository.findById(id, filter);
  }

  @patch('/coffee-shops/{id}', {
    responses: {
      '204': {
        description: 'CoffeeShop PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CoffeeShop, {partial: true}),
        },
      },
    })
    coffeeShop: CoffeeShop,
  ): Promise<void> {
    await this.coffeeShopRepository.updateById(id, coffeeShop);
  }

  @put('/coffee-shops/{id}', {
    responses: {
      '204': {
        description: 'CoffeeShop PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() coffeeShop: CoffeeShop,
  ): Promise<void> {
    await this.coffeeShopRepository.replaceById(id, coffeeShop);
  }

  @del('/coffee-shops/{id}', {
    responses: {
      '204': {
        description: 'CoffeeShop DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.coffeeShopRepository.deleteById(id);
  }
}
