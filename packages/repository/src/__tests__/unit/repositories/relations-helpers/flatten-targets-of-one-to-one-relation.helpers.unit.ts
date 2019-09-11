// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {flattenTargetsOfOneToOneRelation} from '../../../..';
import {
  createCategory,
  createManufacturer,
  createProduct,
} from './relations-helpers-fixtures';

describe('flattenTargetsOfOneToOneRelation', () => {
  describe('uses reduceAsSingleItem strategy for belongsTo relation', () => {
    it('gets the result of passing in a single sourceId', () => {
      const stationery = createCategory({id: 1, name: 'stationery'});
      const pen = createProduct({name: 'pen', categoryId: stationery.id});
      createProduct({name: 'eraser', categoryId: 2});

      const result = flattenTargetsOfOneToOneRelation(
        [pen.categoryId],
        [stationery],
        'id',
      );
      expect(result).to.eql([stationery]);
    });

    it('gets the result of passing in multiple sourceIds', () => {
      const stationery = createCategory({id: 1, name: 'stationery'});
      const book = createCategory({id: 2, name: 'book'});
      const pen = createProduct({name: 'pen', categoryId: stationery.id});
      const pencil = createProduct({
        name: 'pencil',
        categoryId: stationery.id,
      });
      const erasers = createProduct({name: 'eraser', categoryId: book.id});
      // the order of sourceIds matters
      const result = flattenTargetsOfOneToOneRelation(
        [erasers.categoryId, pencil.categoryId, pen.categoryId],
        [book, stationery, stationery],
        'id',
      );
      expect(result).to.deepEqual([book, stationery, stationery]);
    });
  });

  describe('uses reduceAsSingleItem strategy for hasOne relation', () => {
    it('gets the result of passing in a single sourceId', () => {
      const pen = createProduct({id: 1, name: 'pen'});
      const penMaker = createManufacturer({
        name: 'Mr. Plastic',
        productId: pen.id,
      });

      const result = flattenTargetsOfOneToOneRelation(
        [pen.id],
        [penMaker],
        'productId',
      );
      expect(result).to.eql([penMaker]);
    });

    it('gets the result of passing in multiple sourceIds', () => {
      const pen = createProduct({id: 1, name: 'pen'});
      const pencil = createProduct({id: 2, name: 'pencil'});
      const eraser = createProduct({id: 3, name: 'eraser'});
      const penMaker = createManufacturer({
        name: 'Mr. Plastic',
        productId: pen.id,
      });
      const pencilMaker = createManufacturer({
        name: 'Mr. Tree',
        productId: pencil.id,
      });
      const eraserMaker = createManufacturer({
        name: 'Mr. Rubber',
        productId: eraser.id,
      });
      // the order of sourceIds matters
      const result = flattenTargetsOfOneToOneRelation(
        [eraser.id, pencil.id, pen.id],
        [penMaker, pencilMaker, eraserMaker],
        'productId',
      );
      expect(result).to.deepEqual([eraserMaker, pencilMaker, penMaker]);
    });
  });
});
