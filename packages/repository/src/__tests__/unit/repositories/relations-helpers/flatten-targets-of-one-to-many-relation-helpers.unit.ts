// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {flattenTargetsOfOneToManyRelation} from '../../../..';
import {createProduct} from './relations-helpers-fixtures';

describe('flattenTargetsOfOneToManyRelation', () => {
  describe('gets the result of using reduceAsArray strategy for hasMany relation', () => {
    it('gets the result of passing in a single sourceId', () => {
      const pen = createProduct({name: 'pen', categoryId: 1});
      const pencil = createProduct({name: 'pencil', categoryId: 1});
      createProduct({name: 'eraser', categoryId: 2});

      const result = flattenTargetsOfOneToManyRelation(
        [1],
        [pen, pencil],
        'categoryId',
      );
      expect(result).to.eql([[pen, pencil]]);
    });
    it('gets the result of passing in multiple sourceIds', () => {
      const pen = createProduct({name: 'pen', categoryId: 1});
      const pencil = createProduct({name: 'pencil', categoryId: 1});
      const eraser = createProduct({name: 'eraser', categoryId: 2});
      // use [2, 1] here to show the order of sourceIds matters
      const result = flattenTargetsOfOneToManyRelation(
        [2, 1],
        [pen, pencil, eraser],
        'categoryId',
      );
      expect(result).to.deepEqual([[eraser], [pen, pencil]]);
    });
  });
});
