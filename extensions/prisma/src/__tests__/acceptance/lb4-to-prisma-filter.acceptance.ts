// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Where} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {lb4ToPrismaWhereFilter, WhereFilter} from '../..';

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
});
