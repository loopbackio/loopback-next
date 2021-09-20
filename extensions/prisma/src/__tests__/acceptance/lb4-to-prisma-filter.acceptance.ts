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
