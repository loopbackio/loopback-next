// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Where} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  lb4ToPrismaWhereFilter,
  PrismaFilterMalformedLB4NestedProp,
  WhereFilter,
} from '../..';

describe('lb4ToPrismaWhereFilter', () => {
  it('handles nested properties', () => {
    const lb4Filter: Where = {
      'propA.nestedProp': {
        eq: 'valueB',
      },
    };

    const prismaFilter: WhereFilter = {
      propA: {
        nestedProp: {
          equals: 'valueB',
        },
      },
    };

    const testResult = lb4ToPrismaWhereFilter(lb4Filter);
    expect(testResult).to.deepEqual(prismaFilter);
  });

  it('throws when a malformed nested propety key is present', () => {
    const lb4Filter1: Where = {
      'propA.': '',
    };

    const lb4Filter2: Where = {
      '.': '',
    };

    const lb4Filter3: Where = {
      '.propA': '',
    };

    const lb4Filter4: Where = {
      'propA..proB': '',
    };

    const lb4Filters = [lb4Filter1, lb4Filter2, lb4Filter3, lb4Filter4];

    for (const filter of lb4Filters)
      expect(() => lb4ToPrismaWhereFilter(filter)).to.throw(
        PrismaFilterMalformedLB4NestedProp,
      );
  });
});
