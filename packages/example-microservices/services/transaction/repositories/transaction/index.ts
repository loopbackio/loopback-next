// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler, DataSourceConstructor} from '@loopback/repository';
const modelDefinition = require('./models/transaction/model-definition.json');

// tslint:disable:no-any

export class TransactionRepository {
  model;

  constructor() {
    const ds = new DataSourceConstructor('local-fs', {
      connector: 'memory',
      file: './repositories/transaction/datasources/local-fs/data.json',
    });
    this.model = ds.createModel('Transaction', modelDefinition);
  }

  async find(id): Promise<any> {
    return await this.model.find({where: {accountNo: id}});
  }
}
