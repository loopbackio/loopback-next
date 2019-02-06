// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-supplier
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Supplier} from '../models';
import {SupplierRepository} from '../repositories';

export class SupplierController {
  constructor(
    @repository(SupplierRepository)
    public supplierRepository: SupplierRepository,
  ) {}

  @post('/suppliers', {
    responses: {
      '200': {
        description: 'Supplier model instance',
        content: {'application/json': {schema: {'x-ts-type': Supplier}}},
      },
    },
  })
  async create(@requestBody() obj: Supplier): Promise<Supplier> {
    return await this.supplierRepository.create(obj);
  }

  @get('/suppliers/count', {
    responses: {
      '200': {
        description: 'Supplier model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Supplier)) where?: Where,
  ): Promise<Count> {
    return await this.supplierRepository.count(where);
  }

  @get('/suppliers', {
    responses: {
      '200': {
        description: 'Array of Supplier model instances',
        content: {'application/json': {schema: {'x-ts-type': Supplier}}},
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Supplier)) filter?: Filter,
  ): Promise<Supplier[]> {
    return await this.supplierRepository.find(filter);
  }

  @patch('/suppliers', {
    responses: {
      '200': {
        description: 'Supplier PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() obj: Partial<Supplier>,
    @param.query.object('where', getWhereSchemaFor(Supplier)) where?: Where,
  ): Promise<Count> {
    return await this.supplierRepository.updateAll(obj, where);
  }

  @get('/suppliers/{id}', {
    responses: {
      '200': {
        description: 'Supplier model instance',
        content: {'application/json': {schema: {'x-ts-type': Supplier}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Supplier> {
    return await this.supplierRepository.findById(id);
  }

  @patch('/suppliers/{id}', {
    responses: {
      '204': {
        description: 'Supplier PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() obj: Supplier,
  ): Promise<void> {
    await this.supplierRepository.updateById(id, obj);
  }

  @del('/suppliers/{id}', {
    responses: {
      '204': {
        description: 'Supplier DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.supplierRepository.deleteById(id);
  }
}
