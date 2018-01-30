import { juggler, DataSourceConstructor } from '@loopback/repository';
const modelDefinition = require('./models/customer/model-definition.json');

export class CustomerRepository  {
  model;

  constructor() {
    const ds: juggler.DataSource = new DataSourceConstructor('local-fs', {
      connector: 'memory',
      file: './repositories/customer/datasources/local-fs/data.json'
    });
    this.model = ds.createModel('Customer', modelDefinition);
  }

  async find(id): Promise<any> {
    return await this.model.find({where: {id: id}});
  }
}
