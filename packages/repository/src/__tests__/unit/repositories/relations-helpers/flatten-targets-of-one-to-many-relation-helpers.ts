// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  findByForeignKeys,
  flattenTargetsOfOneToManyRelation,
} from '../../../..';
import {
  CategoryRepository,
  ProductRepository,
  testdb,
} from './relations-helpers-fixtures';

describe('flattenTargetsOfOneToManyRelation', () => {
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;

  before(() => {
    productRepo = new ProductRepository(testdb);
    categoryRepo = new CategoryRepository(testdb, async () => productRepo);
  });

  beforeEach(async () => {
    await productRepo.deleteAll();
    await categoryRepo.deleteAll();
  });
  describe('get the result of single sourceId for hasMany relation', async () => {
    it('get the result of using reduceAsArray strategy', async () => {
      const pens = await productRepo.create({name: 'pens', categoryId: 1});
      const pencils = await productRepo.create({
        name: 'pencils',
        categoryId: 1,
      });
      await productRepo.create({name: 'eraser', categoryId: 2});
      const targetsFound = await findByForeignKeys(
        productRepo,
        'categoryId',
        1,
      );

      const result = flattenTargetsOfOneToManyRelation(
        [1],
        targetsFound,
        'categoryId',
      );
      expect(result).to.eql([[pens, pencils]]);
    });
    it('get the result of multiple sourceIds for hasMany relation', async () => {
      const pens = await productRepo.create({name: 'pens', categoryId: 1});
      const pencils = await productRepo.create({
        name: 'pencils',
        categoryId: 1,
      });
      const erasers = await productRepo.create({name: 'eraser', categoryId: 2});
      // use [2, 1] here to show the order of sourceIds matters
      const targetsFound = await findByForeignKeys(productRepo, 'categoryId', [
        2,
        1,
      ]);
      const result = flattenTargetsOfOneToManyRelation(
        [2, 1],
        targetsFound,
        'categoryId',
      );
      expect(result).to.deepEqual([[erasers], [pens, pencils]]);
    });
  });
});
