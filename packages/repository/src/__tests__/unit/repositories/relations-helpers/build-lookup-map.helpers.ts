// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  buildLookupMap,
  reduceAsArray,
  findByForeignKeys,
  reduceAsSingleItem,
} from '../../../..';
import {
  Category,
  CategoryRepository,
  Product,
  ProductRepository,
  testdb,
} from './relations-helpers-fixtures';

describe('buildLoopupMap', () => {
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
  describe('get the result of using reduceAsArray strategy', async () => {
    it('returns multiple instances in an array', async () => {
      const pens = await productRepo.create({name: 'pens', categoryId: 1});
      const pencils = await productRepo.create({
        name: 'pencils',
        categoryId: 1,
      });
      await productRepo.create({name: 'eraser', categoryId: 2});
      const products = await findByForeignKeys(productRepo, 'categoryId', 1);

      const result = buildLookupMap<unknown, Product, Category[]>(
        products,
        'categoryId',
        reduceAsArray,
      );
      const expected = new Map<Number, Array<Product>>();
      expected.set(1, [pens, pencils]);
      expect(result).to.eql(expected);
    });
    it('return instances in multiple arrays', async () => {
      const pens = await productRepo.create({name: 'pens', categoryId: 1});
      const pencils = await productRepo.create({
        name: 'pencils',
        categoryId: 1,
      });
      const erasers = await productRepo.create({name: 'eraser', categoryId: 2});
      const products = await findByForeignKeys(productRepo, 'categoryId', [
        1,
        2,
      ]);

      const result = buildLookupMap<unknown, Product, Category[]>(
        products,
        'categoryId',
        reduceAsArray,
      );
      const expected = new Map<Number, Array<Product>>();
      expected.set(1, [pens, pencils]);
      expected.set(2, [erasers]);
      expect(result).to.eql(expected);
    });
  });
  describe('get the result of using reduceAsSingleItem strategy', async () => {
    it('returns one instance when one target instance is passed in', async () => {
      const cat = await categoryRepo.create({id: 1, name: 'angus'});
      const pens = await productRepo.create({name: 'pens', categoryId: 1});
      //const pencils = await productRepo.create({name: 'pencils', categoryId: 1});
      await productRepo.create({name: 'eraser', categoryId: 2});
      // 'id' is the foreign key in Category in respect to Product when we tlak about belongsTo
      const category = await findByForeignKeys(
        categoryRepo,
        'id',
        pens.categoryId,
      );

      const result = buildLookupMap<unknown, Category>(
        category,
        'id',
        reduceAsSingleItem,
      );
      const expected = new Map<Number, Category>();
      expected.set(1, cat);
      //expected.set(2, [pencils]);
      expect(result).to.eql(expected);
    });
    it('returns multiple instances when multiple target instances are passed in', async () => {
      const cat1 = await categoryRepo.create({id: 1, name: 'Angus'});
      const cat2 = await categoryRepo.create({id: 2, name: 'Nola'});
      const pens = await productRepo.create({name: 'pens', categoryId: 1});
      const pencils = await productRepo.create({
        name: 'pencils',
        categoryId: 1,
      });
      const erasers = await productRepo.create({
        name: 'erasers',
        categoryId: 2,
      });
      // 'id' is the foreign key in Category in respect to Product when we tlak about belongsTo
      const category = await findByForeignKeys(categoryRepo, 'id', [
        pens.categoryId,
        pencils.categoryId,
        erasers.categoryId,
      ]);

      const result = buildLookupMap<unknown, Category>(
        category,
        'id',
        reduceAsSingleItem,
      );
      const expected = new Map<Number, Category>();
      expected.set(1, cat1);
      expected.set(2, cat2);
      expect(result).to.eql(expected);
    });
  });
});
