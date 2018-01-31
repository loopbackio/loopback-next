// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, Where} from '@loopback/repository';
import {api} from '@loopback/rest';
import {def} from './AccountController.api';
import {AccountRepository} from '../repositories/account';

// tslint:disable:no-any

@api(def)
export class AccountController {
  repository: AccountRepository;

  constructor() {
    this.repository = new AccountRepository();
  }

  async getAccount(filter: string) {
    return await this.repository.find(JSON.parse(filter));
  }

  async createAccount(accountInstance: any) {
    return await this.repository.create(accountInstance);
  }

  async updateAccount(where: string, data: any) {
    return await this.repository.update(JSON.parse(where), data);
  }

  async deleteAccount(where: string) {
    return await this.repository.deleteAccount(JSON.parse(where));
  }
}
