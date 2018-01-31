// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler, DataSourceConstructor} from '@loopback/repository';
const modelDefinition = require('./models/account/model-definition.json');

// tslint:disable:no-any

export class AccountRepository {
  model: any;

  constructor(file?: string) {
    const ds: juggler.DataSource = new DataSourceConstructor('local-fs', {
      connector: 'memory',
      file: file || './repositories/account/datasources/local-fs/data.json',
    });

    this.model = ds.createModel('Account', modelDefinition.properties, {});
  }

  async find(filter: any): Promise<Account[]> {
    return await this.model.find(filter);
  }

  async create(accountInstance: any): Promise<Account> {
    return await this.model.create(accountInstance);
  }

  async update(where: any, data: any): Promise<any> {
    return await this.model.updateAll(where, data, {});
  }

  async deleteAccount(where: any): Promise<any> {
    return await this.model.destroyAll(where);
  }
}
