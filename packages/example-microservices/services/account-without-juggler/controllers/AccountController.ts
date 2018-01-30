import { api } from '@loopback/core';
import { def } from './AccountController.api';
import { AccountRepository } from '../repositories/account';
import { inject } from '@loopback/context';
import { Account } from '../repositories/account/models/Account';

@api(def)
export class AccountController {
  @inject('repositories.account') private repository: AccountRepository
  constructor() {}

  //fixme figure out how to use Filter interface
  //fixme filter is string even though swagger spec
  //defines it as object type
  async getAccount(filter: string): Promise<Account[]> {
    return await this.repository.find(JSON.parse(filter));
  }

  async createAccount(accountInstance: Object): Promise<Account> {
    return await this.repository.create(accountInstance);
  }

  async updateById(id: string, data: Object) {
    return await this.repository.updateById(id, data);
  }

  async deleteById(id: string) {
    return await this.repository.deleteById(id);
  }
}
