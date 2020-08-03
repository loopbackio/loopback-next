// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-postgresql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultTransactionalRepository,
  Entity,
  juggler,
  model,
  property,
} from '@loopback/repository';
import {expect, toJSON} from '@loopback/testlab';
import {POSTGRESQL_CONFIG} from './postgresql.datasource';

describe('PostgreSQL repository.execute()', () => {
  // FIXME(bajtos) This test passes when executed in isolation, but fails
  // on connection timeout when executed after repository-test suite.
  it.skip('executes a parameterized native SQL query', async () => {
    const db = new juggler.DataSource(POSTGRESQL_CONFIG);

    @model()
    class Product extends Entity {
      @property({id: true, generated: true})
      id: number;

      @property({required: true})
      name: string;
    }

    const repo = new DefaultTransactionalRepository<Product, number, {}>(
      Product,
      db,
    );
    await db.automigrate(Product.modelName);
    const pen = await repo.create({name: 'Pen'});
    await repo.create({name: 'Car'});

    const result = await repo.execute('SELECT * FROM Product WHERE name = $1', [
      'Pen',
    ]);

    expect(toJSON(result)).to.deepEqual([toJSON(pen)]);
  });
});
