// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-mongodb
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
import {MONGODB_CONFIG} from './mongodb.datasource';

describe('MongoDB repository.execute()', () => {
  it('executes a custom MongoDB query', async () => {
    const db = new juggler.DataSource(MONGODB_CONFIG);

    @model()
    class Product extends Entity {
      @property({id: true, generated: true})
      id: string;

      @property({required: true})
      name: string;

      @property()
      owner: string;
    }

    const repo = new DefaultTransactionalRepository<Product, string, {}>(
      Product,
      db,
    );
    await db.automigrate(Product.modelName);
    await repo.create({name: 'Pen', owner: 'bajtos'});
    await repo.create({name: 'Car', owner: 'admin'});
    await repo.create({name: 'Chair', owner: 'admin'});

    // MongoDB's aggregate() command returns an AggregationCursor instance
    const cursor = await repo.execute('Product', 'aggregate', [
      {
        $group: {
          _id: '$owner',
          count: {$sum: 1},
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    // Fetch all items from the cursor at once
    const result = await cursor.toArray();

    expect(toJSON(result)).to.deepEqual([
      {_id: 'admin', count: 2},
      {_id: 'bajtos', count: 1},
    ]);
  });
});
