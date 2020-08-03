// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-mysql
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
import {MYSQL_CONFIG} from './mysql.datasource';

describe('MySQL repository.execute()', () => {
  it('executes a parameterized native SQL query', async () => {
    const db = new juggler.DataSource(MYSQL_CONFIG);

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

    const result = await repo.execute('SELECT * FROM Product WHERE name = ?', [
      'Pen',
    ]);

    expect(toJSON(result)).to.deepEqual([toJSON(pen)]);
  });
});
