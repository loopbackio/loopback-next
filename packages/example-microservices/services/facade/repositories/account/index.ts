// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler, DataSourceConstructor} from '@loopback/repository';

// tslint:disable:no-any

// mixin of data source into service is not yet available, swagger.json needs to
// be loaded synchronously (ie. can't instantiate in the class constructor)

const ds = new DataSourceConstructor('AccountService', {
  connector: 'swagger',
  spec: 'repositories/account/swagger.json',
});

export class AccountRepository {
  model;

  constructor() {
    this.model = ds.createModel('AccountService', {});
  }

  async find(accountNumber) {
    const response = await this.model.findById({id: accountNumber});
    const accounts = (response && response.obj) || [];
    return accounts.length ? accounts[0] : {};
  }

  async create(accountInstance): Promise<any> {
    return await this.model.create(accountInstance);
  }
}
