import { Filter, Where } from '@loopback/repository';
import { api } from '@loopback/core';
import { def } from './AccountController.api';
import { AccountRepository } from '../repositories/account';

@api(def)
export class AccountController {
  repository: AccountRepository;

  constructor() {
    this.repository = new AccountRepository();
  }

  async getAccount(filter) {
    return await this.repository.find(JSON.parse(filter));
  }

 async createAccount(accountInstance) {
    return await this.repository.create(accountInstance);
  }

  async updateAccount(where, data) {
    return await this.repository.update(JSON.parse(where), data);
  }

   async deleteAccount(where) {
    return await this.repository.deleteAccount(JSON.parse(where));
  }
}
