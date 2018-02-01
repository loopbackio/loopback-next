// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {map, takeUntil, reduce, takeWhile, filter} from '../../src/iteratable';

describe('Utilities for iteratable composition', () => {
  let items: Iterable<number>;

  beforeEach(givenIterable);

  describe('map()', () => {
    it('maps each entry of the iterator', () => {
      const result = map(items, item => item * 2);
      expect(Array.from(result)).to.eql([2, 4, 6]);
    });
  });

  describe('filter()', () => {
    it('filter each entry of the iterator', () => {
      const result = filter(items, item => item % 2 === 1);
      expect(Array.from(result)).to.eql([1, 3]);
    });
  });

  describe('takeUntil()', () => {
    it('takes entries until the predicator returns true', () => {
      const result = takeUntil(items, item => item % 2 === 0);
      expect(Array.from(result)).to.eql([1, 2]);
    });

    it('takes all entries if the predicator always return false', () => {
      const result = takeUntil(items, item => false);
      expect(Array.from(result)).to.eql([1, 2, 3]);
    });
  });

  describe('takeWhile()', () => {
    it('takes entries while the predicator returns true', () => {
      const result = takeWhile(items, item => item <= 2);
      expect(Array.from(result)).to.eql([1, 2]);
    });

    it('takes all entries if the predicator always return true', () => {
      const result = takeWhile(items, item => true);
      expect(Array.from(result)).to.eql([1, 2, 3]);
    });
  });

  describe('reduce()', () => {
    it('reduces entries of the iterator', () => {
      const result = reduce(
        items,
        (accumulator, current) => accumulator + current,
        0,
      );
      expect(result).to.eql(6);
    });
  });

  function givenIterable() {
    items = [1, 2, 3];
  }
});
