// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DataSource} from 'loopback-datasource-juggler';
import {Product} from '../fixtures/models/product.model';
import {ProductRepository} from '../fixtures/repositories/product.repository';
import {expect} from '@loopback/testlab';
import {
  Entity,
  model,
  DefaultCrudRepository,
  property,
  AnyObject,
} from '../../src';

// This test shows the recommended way how to use @loopback/repository
// together with existing connectors when building LoopBack applications
describe('Repository in Thinking in LoopBack', () => {
  let repo: ProductRepository;
  beforeEach(givenProductRepository);

  it('counts models in empty database', async () => {
    expect(await repo.count()).to.equal(0);
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

  it('enables strict delete by default', async () => {
    await repo.create({slug: 'pencil'});
    await expect(repo.deleteById(10000)).to.be.rejectedWith(
      /No instance with id/,
    );
  });

  it('disables strict delete via configuration', async () => {
    @model({settings: {strictDelete: false}})
    class Pencil extends Entity {
      @property({id: true})
      id: number;
      @property({type: 'string'})
      name: string;
    }

    const pencilRepo = new DefaultCrudRepository<
      Pencil,
      typeof Pencil.prototype.id
    >(Pencil, new DataSource({connector: 'memory'}));

    await pencilRepo.create({
      name: 'Green Pencil',
    });

    // When `strictDelete` is set to `false`, `deleteById()` on a non-existing
    // resource is resolved with `false`, instead of being rejected.
    await expect(pencilRepo.deleteById(10000)).to.be.fulfilledWith(false);
  });

  function givenProductRepository() {
    const db = new DataSource({
      connector: 'memory',
    });
    repo = new ProductRepository(db);
  }
});
