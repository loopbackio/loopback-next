// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {
  CrudRepository,
  CrudRepositoryImpl,
  DataSource,
  Entity,
  EntityData,
  Class,
  Filter,
  Where,
  Options,
  CrudConnector,
  AnyObject,
  Count,
} from '../../..';

/**
 * A mock up connector implementation
 */
class CrudConnectorStub implements CrudConnector {
  private entities: EntityData[] = [];
  name: 'my-connector';

  connect() {
    return Promise.resolve();
  }

  disconnect() {
    return Promise.resolve();
  }

  ping() {
    return Promise.resolve();
  }

  create(
    modelClass: Class<Entity>,
    entity: EntityData,
    options?: Options,
  ): Promise<EntityData> {
    this.entities.push(entity);
    return Promise.resolve(entity);
  }

  find(
    modelClass: Class<Entity>,
    filter?: Filter,
    options?: Options,
  ): Promise<EntityData[]> {
    return Promise.resolve(this.entities);
  }

  updateAll(
    modelClass: Class<Entity>,
    data: EntityData,
    where?: Where,
    options?: Options,
  ): Promise<Count> {
    for (const p in data) {
      for (const e of this.entities) {
        (e as AnyObject)[p] = (data as AnyObject)[p];
      }
    }
    return Promise.resolve({count: this.entities.length});
  }

  deleteAll(
    modelClass: Class<Entity>,
    where?: Where,
    options?: Options,
  ): Promise<Count> {
    const items = this.entities.splice(0, this.entities.length);
    return Promise.resolve({count: items.length});
  }

  count(
    modelClass: Class<Entity>,
    where?: Where,
    options?: Options,
  ): Promise<Count> {
    return Promise.resolve({count: this.entities.length});
  }
}

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
