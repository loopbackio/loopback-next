// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {api} from '@loopback/core';
import {def} from './TransactionController.api';
import {TransactionRepository} from '../repositories/transaction';

@api(def)
export class TransactionController {
  repository: TransactionRepository;

  constructor() {
    this.repository = new TransactionRepository();
  }

  async getTransactions(filter): Promise<any> {
    const transactions = await this.repository.find(filter);
    const response = [];
    transactions.forEach(transaction => {
      response.push(transaction.toJSON());
    });
    return response;
  }
}
