// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-Supplier
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
  getWhereSchemaFor,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {Account} from '../models';
import {SupplierRepository} from '../repositories';

export class SupplierAccountController {
  constructor(
    @repository(SupplierRepository) protected supplierRepo: SupplierRepository,
  ) {}

  @post('/suppliers/{id}/accounts', {
    responses: {
      '200': {
        description: 'Supplier.Account model instance',
        content: {'application/json': {schema: {'x-ts-type': Account}}},
      },
    },
  })
  async create(
    @param.path.string('id') id: string,
    @requestBody() account: Account,
  ): Promise<Account> {
    return await this.supplierRepo.accounts(id).create(account);
  }

  @get('/suppliers/{id}/accounts', {
    responses: {
      '200': {
        description: "Array of Account's belonging to Supplier",
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Account}},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter,
  ): Promise<Account> {
    return await this.supplierRepo.accounts(id).get(filter);
    //    return await this.supplierRepo.accounts(id).find(filter);
  }

  @del('/suppliers/{id}/accounts', {
    responses: {
      '200': {
        description: 'Supplier.Account DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Account)) where?: Where,
  ): Promise<Count> {
    return await this.supplierRepo.accounts(id).delete(where);
  }
}
