import { juggler, DataSourceConstructor } from '@loopback/repository';

// mixin of data source into service is not yet available, swagger.json needs to
// be loaded synchronously (ie. can't instantiate in the class constructor)

var SwaggerClient = require('swagger-client');
const ds = new DataSourceConstructor('CustomerService', {
  connector: 'swagger',
  spec: 'repositories/customer/swagger.json'
});

export class CustomerRepository {
  model;

  constructor() {
    this.model = ds.createModel('CustomerService', {});
  }

  async find(customerNumber) {
    const response = await this.model.findById({ id: customerNumber });
    return response && response.obj || [];
  }
}
