// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {buildLookupMap, reduceAsArray, reduceAsSingleItem} from '../../../..';
import {
  Category,
  Product,
  createProduct,
  createCategory,
} from './relations-helpers-fixtures';

describe('buildLookupMap', () => {
  describe('get the result of using reduceAsArray strategy for hasMany relation', () => {
    it('returns multiple instances in an array', () => {
      const pen = createProduct({name: 'pen', categoryId: 1});
      const pencil = createProduct({name: 'pencil', categoryId: 1});

      const result = buildLookupMap<unknown, Product, Category[]>(
        [pen, pencil],
        'categoryId',
        reduceAsArray,
      );
      const expected = new Map<Number, Array<Product>>();
      expected.set(1, [pen, pencil]);
      expect(result).to.eql(expected);
    });

    it('return instances in multiple arrays', () => {
      const pen = createProduct({name: 'pen', categoryId: 1});
      const pencil = createProduct({name: 'pencil', categoryId: 1});
      const eraser = createProduct({name: 'eraser', categoryId: 2});
      // 'id' is the foreign key in Category in respect to Product when we talk about belongsTo
      const result = buildLookupMap<unknown, Product, Category[]>(
        [pen, eraser, pencil],
        'categoryId',
        reduceAsArray,
      );
      const expected = new Map<Number, Array<Product>>();
      expected.set(1, [pen, pencil]);
      expected.set(2, [eraser]);
      expect(result).to.eql(expected);
    });
  });

  describe('get the result of using reduceAsSingleItem strategy for belongsTo relation', () => {
    it('returns one instance when one target instance is passed in', () => {
      const cat = createCategory({name: 'stationery', id: 1});

      const result = buildLookupMap<unknown, Category>(
        [cat],
        'id',
        reduceAsSingleItem,
      );
      const expected = new Map<Number, Category>();
      expected.set(1, cat);
      expect(result).to.eql(expected);
    });

    it('returns multiple instances when multiple target instances are passed in', () => {
      const cat1 = createCategory({name: 'stationery', id: 1});
      const cat2 = createCategory({name: 'book', id: 2});

      // 'id' is the foreign key in Category in respect to Product when we talk about belongsTo
      const result = buildLookupMap<unknown, Category>(
        [cat1, cat2],
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
