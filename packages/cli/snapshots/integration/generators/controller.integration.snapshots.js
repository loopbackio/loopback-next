// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 controller REST CRUD controller creates REST CRUD template with valid input - id omitted 1`] = `
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {ProductReview} from '../models';
import {BarRepository} from '../repositories';

export class ProductReviewController {
  constructor(
    @repository(BarRepository)
    public barRepository : BarRepository,
  ) {}

  @post('/product-reviews', {
    responses: {
      '200': {
        description: 'ProductReview model instance',
        content: {'application/json': {schema: getModelSchemaRef(ProductReview)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductReview, {
            title: 'NewProductReview',
            exclude: ['productId'],
          }),
        },
      },
    })
    productReview: Omit<ProductReview, 'productId'>,
  ): Promise<ProductReview> {
    return this.barRepository.create(productReview);
  }

  @get('/product-reviews/count', {
    responses: {
      '200': {
        description: 'ProductReview model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(ProductReview)) where?: Where<ProductReview>,
  ): Promise<Count> {
    return this.barRepository.count(where);
  }

  @get('/product-reviews', {
    responses: {
      '200': {
        description: 'Array of ProductReview model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProductReview)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ProductReview)) filter?: Filter<ProductReview>,
  ): Promise<ProductReview[]> {
    return this.barRepository.find(filter);
  }

  @patch('/product-reviews', {
    responses: {
      '200': {
        description: 'ProductReview PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductReview, {partial: true}),
        },
      },
    })
    productReview: ProductReview,
    @param.query.object('where', getWhereSchemaFor(ProductReview)) where?: Where<ProductReview>,
  ): Promise<Count> {
    return this.barRepository.updateAll(productReview, where);
  }

  @get('/product-reviews/{id}', {
    responses: {
      '200': {
        description: 'ProductReview model instance',
        content: {'application/json': {schema: getModelSchemaRef(ProductReview)}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<ProductReview> {
    return this.barRepository.findById(id);
  }

  @patch('/product-reviews/{id}', {
    responses: {
      '204': {
        description: 'ProductReview PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductReview, {partial: true}),
        },
      },
    })
    productReview: ProductReview,
  ): Promise<void> {
    await this.barRepository.updateById(id, productReview);
  }

  @put('/product-reviews/{id}', {
    responses: {
      '204': {
        description: 'ProductReview PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() productReview: ProductReview,
  ): Promise<void> {
    await this.barRepository.replaceById(id, productReview);
  }

  @del('/product-reviews/{id}', {
    responses: {
      '204': {
        description: 'ProductReview DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.barRepository.deleteById(id);
  }
}

`;


exports[`lb4 controller REST CRUD controller creates REST CRUD template with valid input 1`] = `
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {ProductReview} from '../models';
import {BarRepository} from '../repositories';

export class ProductReviewController {
  constructor(
    @repository(BarRepository)
    public barRepository : BarRepository,
  ) {}

  @post('/product-reviews', {
    responses: {
      '200': {
        description: 'ProductReview model instance',
        content: {'application/json': {schema: getModelSchemaRef(ProductReview)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductReview, {
            title: 'NewProductReview',
            
          }),
        },
      },
    })
    productReview: ProductReview,
  ): Promise<ProductReview> {
    return this.barRepository.create(productReview);
  }

  @get('/product-reviews/count', {
    responses: {
      '200': {
        description: 'ProductReview model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(ProductReview)) where?: Where<ProductReview>,
  ): Promise<Count> {
    return this.barRepository.count(where);
  }

  @get('/product-reviews', {
    responses: {
      '200': {
        description: 'Array of ProductReview model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ProductReview)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ProductReview)) filter?: Filter<ProductReview>,
  ): Promise<ProductReview[]> {
    return this.barRepository.find(filter);
  }

  @patch('/product-reviews', {
    responses: {
      '200': {
        description: 'ProductReview PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductReview, {partial: true}),
        },
      },
    })
    productReview: ProductReview,
    @param.query.object('where', getWhereSchemaFor(ProductReview)) where?: Where<ProductReview>,
  ): Promise<Count> {
    return this.barRepository.updateAll(productReview, where);
  }

  @get('/product-reviews/{id}', {
    responses: {
      '200': {
        description: 'ProductReview model instance',
        content: {'application/json': {schema: getModelSchemaRef(ProductReview)}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<ProductReview> {
    return this.barRepository.findById(id);
  }

  @patch('/product-reviews/{id}', {
    responses: {
      '204': {
        description: 'ProductReview PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductReview, {partial: true}),
        },
      },
    })
    productReview: ProductReview,
  ): Promise<void> {
    await this.barRepository.updateById(id, productReview);
  }

  @put('/product-reviews/{id}', {
    responses: {
      '204': {
        description: 'ProductReview PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() productReview: ProductReview,
  ): Promise<void> {
    await this.barRepository.replaceById(id, productReview);
  }

  @del('/product-reviews/{id}', {
    responses: {
      '204': {
        description: 'ProductReview DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.barRepository.deleteById(id);
  }
}

`;


exports[`lb4 controller basic controller scaffolds correct file with args 1`] = `
// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class ProductReviewController {
  constructor() {}
}

`;


exports[`lb4 controller basic controller scaffolds correct file with input 1`] = `
// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class ProductReviewController {
  constructor() {}
}

`;
