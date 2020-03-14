// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Add these imports for interceptors
import {intercept} from '@loopback/core';
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
import {ValidatePhoneNumInterceptor} from '../interceptors';
import {CoffeeShop} from '../models';
import {CoffeeShopRepository} from '../repositories';

// Add this line to apply interceptor to this class
@intercept(ValidatePhoneNumInterceptor.BINDING_KEY)
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
            exclude: ['shopId'],
          }),
        },
      },
    })
    coffeeShop: Omit<CoffeeShop, 'shopId'>,
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
    @param.path.string('id') id: string,
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
    @param.path.string('id') id: string,
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
    @param.path.string('id') id: string,
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
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.coffeeShopRepository.deleteById(id);
  }
}
