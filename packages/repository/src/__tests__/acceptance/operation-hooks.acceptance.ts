// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {DataSource} from 'loopback-datasource-juggler';
import {DefaultCrudRepository, juggler} from '../..';
import {Product, ProductRelations} from '../fixtures/models/product.model';

// This test shows the recommended way how to use @loopback/repository
// together with existing connectors when building LoopBack applications
describe('Operation hooks', () => {
  let repo: ProductRepository;
  beforeEach(givenProductRepository);

  const beforeSave = 'before save';
  const afterSave = 'after save';
  const expectedArray = [beforeSave, afterSave];

  it('supports operation hooks', async () => {
    await repo.create({slug: 'pencil'});
    expect(repo.hooksCalled).to.eql(expectedArray);
  });

  function givenProductRepository() {
    const db = new DataSource({
      connector: 'memory',
    });

    repo = new ProductRepository(db);
  }

  class ProductRepository extends DefaultCrudRepository<
    Product,
    typeof Product.prototype.id,
    ProductRelations
  > {
    constructor(dataSource: juggler.DataSource) {
      super(Product, dataSource);
    }

    hooksCalled: string[] = [];

    definePersistedModel(entityClass: typeof Product) {
      const modelClass = super.definePersistedModel(entityClass);
      modelClass.observe(beforeSave, async ctx => {
        this.hooksCalled.push(beforeSave);
      });

      modelClass.observe(afterSave, async ctx => {
        this.hooksCalled.push(afterSave);
      });
      return modelClass;
    }
  }
});
