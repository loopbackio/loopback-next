// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {DataSource} from 'loopback-datasource-juggler';
import {AnyObject, DefaultCrudRepository, Entity, model, property} from '../..';
import {Product} from '../fixtures/models/product.model';
import {ProductRepository} from '../fixtures/repositories/product.repository';

// This test shows the recommended way how to use @loopback/repository
// together with existing connectors when building LoopBack applications
describe('Repository in Thinking in LoopBack', () => {
  let repo: ProductRepository;
  beforeEach(givenProductRepository);

  it('counts models in empty database', async () => {
    expect(await repo.count()).to.deepEqual({count: 0});
  });

  it('creates a new model', async () => {
    const p: Product = await repo.create({name: 'Ink Pen', slug: 'pen'});
    expect(p).instanceof(Product);
    expect.exists(p.id);
  });

  it('can save a model', async () => {
    const p = await repo.create({slug: 'pencil'});

    p.name = 'Red Pencil';
    await repo.save(p);

    await repo.findById(p.id);
    expect(p).to.have.properties({
      slug: 'pencil',
      name: 'Red Pencil',
    });
  });

  it('rejects extra model properties (defaults to strict mode)', async () => {
    await expect(
      repo.create({name: 'custom', extra: 'additional-data'} as AnyObject),
    ).to.be.rejectedWith(/extra.*not defined/);
  });

  it('allows models to allow additional properties', async () => {
    // TODO(bajtos) Add syntactic sugar to allow the following usage:
    //    @model({strict: false})
    @model({settings: {strict: false}})
    class Flexible extends Entity {
      @property({id: true})
      id: number;
    }

    const flexibleRepo = new DefaultCrudRepository<
      Flexible,
      typeof Flexible.prototype.id
    >(Flexible, new DataSource({connector: 'memory'}));

    const created = await flexibleRepo.create({
      extra: 'additional data',
    } as AnyObject);
    const stored = await flexibleRepo.findById(created.id);
    expect(stored).to.containDeep({extra: 'additional data'});
  });

  function givenProductRepository() {
    const db = new DataSource({
      connector: 'memory',
    });
    repo = new ProductRepository(db);
  }
});
