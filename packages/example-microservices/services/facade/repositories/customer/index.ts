// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler, DataSourceConstructor} from '@loopback/repository';

// mixin of data source into service is not yet available, swagger.json needs to
// be loaded synchronously (ie. can't instantiate in the class constructor)

const SwaggerClient = require('swagger-client');
const ds = new DataSourceConstructor('CustomerService', {
  connector: 'swagger',
  spec: 'repositories/customer/swagger.json',
});

export class CustomerRepository {
  model;

  constructor() {
    this.model = ds.createModel('CustomerService', {});
  }

  async find(customerNumber) {
    const response = await this.model.findById({id: customerNumber});
    return (response && response.obj) || [];
  }
}
