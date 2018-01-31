// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {api} from '@loopback/rest';
import {def} from './AccountManagementController.api';
import {AccountRepository} from '../repositories/account';
import {CustomerRepository} from '../repositories/customer';
import {TransactionRepository} from '../repositories/transaction';
import bluebird = require('bluebird');

// tslint:disable:no-any

@api(def)
export class AccountController {
  accountRepository: AccountRepository;
  customerRepository: CustomerRepository;
  transactionRepository: TransactionRepository;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.customerRepository = new CustomerRepository();
    this.transactionRepository = new TransactionRepository();
  }

  async getSummary(accountNumber): Promise<any> {
    const account = await this.accountRepository.find(accountNumber);
    const summary = await bluebird.props({
      account: account,
      customer: this.customerRepository.find(account.customerNumber),
      transaction: this.transactionRepository.find(accountNumber),
    });
    return JSON.stringify(summary);
  }

  async getAccount(accountNumber): Promise<any> {
    const account = await this.accountRepository.find(accountNumber);
    return JSON.stringify(account);
  }

  async createAccount(accountInstance): Promise<any> {
    const account = await this.accountRepository.create(accountInstance);
    return JSON.stringify(account);
  }
}
