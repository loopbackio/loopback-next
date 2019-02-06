// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-account-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, repository} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  param,
  patch,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import {Account, Supplier} from '../models';
import {AccountRepository} from '../repositories';

export class AccountController {
  constructor(
    @repository(AccountRepository) protected accountRepo: AccountRepository,
  ) {}

  @post('/accounts', {
    responses: {
      '200': {
        description: 'Account model instance',
        content: {'application/json': {schema: {'x-ts-type': Account}}},
      },
    },
  })
  async createAccount(@requestBody() account: Account) {
    return await this.accountRepo.create(account);
  }

  @get('/accounts/{id}', {
    responses: {
      '200': {
        description: 'Account model instance',
        content: {'application/json': {schema: {'x-ts-type': Account}}},
      },
    },
  })
  async findAccountById(
    @param.path.string('id') id: string,
    @param.query.boolean('items') items?: boolean,
  ): Promise<Account> {
    return await this.accountRepo.findById(id);
  }

  @get('/accounts', {
    responses: {
      '200': {
        description: 'Array of Account model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Account}},
          },
        },
      },
    },
  })
  async findAccounts(
    @param.query.object('filter', getFilterSchemaFor(Account)) filter?: Filter,
  ): Promise<Account[]> {
    return await this.accountRepo.find(filter);
  }

  @put('/accounts/{id}', {
    responses: {
      '204': {
        description: 'Account PUT success',
      },
    },
  })
  async replaceAccount(
    @param.path.string('id') id: string,
    @requestBody() account: Account,
  ): Promise<void> {
    await this.accountRepo.replaceById(id, account);
  }

  @patch('/accounts/{id}', {
    responses: {
      '204': {
        description: 'Account PATCH success',
      },
    },
  })
  async updateAccount(
    @param.path.string('id') id: string,
    @requestBody() account: Account,
  ): Promise<void> {
    await this.accountRepo.updateById(id, account);
  }

  @del('/accounts/{id}', {
    responses: {
      '204': {
        description: 'Account DELETE success',
      },
    },
  })
  async deleteAccount(@param.path.string('id') id: string): Promise<void> {
    await this.accountRepo.deleteById(id);
  }

  @get('/accounts/{id}/account', {
    responses: {
      '200': {
        description: 'Supplier model instance',
        content: {'application/json': {schema: {'x-ts-type': Supplier}}},
      },
    },
  })
  async findOwningList(@param.path.string('id') id: string): Promise<Supplier> {
    return await this.accountRepo.supplier(id);
  }
}
