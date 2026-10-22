// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/filter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {FilterBuilder, WhereBuilder} from '../..';

describe('WhereBuilder — uncovered branches', () => {
  describe('impose() with no prior where (undefined internal state)', () => {
    it('assigns the given where when internal where is falsy', () => {
      const builder = new WhereBuilder();
      // Force the internal state to undefined to exercise the !this.where branch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (builder as any).where = undefined;

      builder.impose({name: 'John'});

      expect(builder.build()).to.deepEqual({name: 'John'});
    });

    it('assigns empty object when given where is falsy', () => {
      const builder = new WhereBuilder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (builder as any).where = undefined;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      builder.impose(undefined as any);

      expect(builder.build()).to.deepEqual({});
    });
  });
});

describe('FilterBuilder — uncovered branches', () => {
  describe('impose() with no prior filter (undefined internal state)', () => {
    it('wraps a plain Where in a Filter when internal filter is falsy', () => {
      const builder = new FilterBuilder();
      // Force internal state to undefined to exercise the !this.filter branch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (builder as any).filter = undefined;

      builder.impose({name: 'John'});

      expect(builder.build()).to.deepEqual({where: {name: 'John'}});
    });

    it('uses a Filter directly when internal filter is falsy', () => {
      const builder = new FilterBuilder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (builder as any).filter = undefined;

      builder.impose({where: {age: 30}});

      expect(builder.build()).to.deepEqual({where: {age: 30}});
    });
  });
});
