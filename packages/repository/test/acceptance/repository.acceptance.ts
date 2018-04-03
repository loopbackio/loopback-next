// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DataSourceConstructor} from '../..';
import {Product} from '../fixtures/models/product.model';
import {ProductRepository} from '../fixtures/repositories/product.repository';
import {expect} from '@loopback/testlab';

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

  function givenProductRepository() {
    const db = new DataSourceConstructor({
      connector: 'memory',
    });
    repo = new ProductRepository(db);
  }
});
