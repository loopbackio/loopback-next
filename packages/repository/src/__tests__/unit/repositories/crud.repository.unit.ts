// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  CrudConnector,
  CrudRepository,
  CrudRepositoryImpl,
  DataSource,
  Entity,
} from '../../..';
import {CrudConnectorStub} from '../crud-connector.stub';

/**
 * A mock up model class
 */
class Customer extends Entity {
  id: number;
  email: string;

  constructor(data: Partial<Customer>) {
    super();
    if (data && typeof data.id === 'number') {
      this.id = data.id;
    }
    if (data && typeof data.email === 'string') {
      this.email = data.email;
    }
  }
}

describe('CrudRepositoryImpl', () => {
  let ds: DataSource;
  let repo: CrudRepository<Customer>;

  before(() => {
    const connector: CrudConnector = new CrudConnectorStub();
    ds = {
      name: 'myDataSource',
      settings: {},
      connector: connector,
    };
    repo = new CrudRepositoryImpl(ds, Customer);
  });

  beforeEach(async () => {
    await repo.deleteAll();
  });

  it('creates an entity', async () => {
    const customer = await repo.create({id: 1, email: 'john@example.com'});
    expect(customer.id).to.be.eql(1);
  });

  it('updates all entities', async () => {
    await repo.create({id: 1, email: 'john@example.com'});
    await repo.create({id: 2, email: 'mary@example.com'});
    const result = await repo.updateAll({email: 'xyz@example.com'});
    expect(result.count).to.be.eql(2);
  });

  it('find all entities', async () => {
    const c1 = await repo.create({id: 1, email: 'john@example.com'});
    const c2 = await repo.create({id: 2, email: 'mary@example.com'});
    const customers = await repo.find();
    expect(customers).to.eql([c1, c2]);
  });

  it('delete all entities', async () => {
    await repo.create({id: 1, email: 'john@example.com'});
    await repo.create({id: 2, email: 'mary@example.com'});
    const result = await repo.deleteAll();
    expect(result.count).to.be.eql(2);
  });

  it('count all entities', async () => {
    await repo.create({id: 1, email: 'john@example.com'});
    const result = await repo.count();
    expect(result.count).to.be.eql(1);
  });
});
