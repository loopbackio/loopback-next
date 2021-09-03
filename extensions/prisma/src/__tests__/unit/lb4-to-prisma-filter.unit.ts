import {Filter, Where} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  Filter as PrismaFilter,
  lb4ToPrismaFilter,
  lb4ToPrismaWhereFilter,
  WhereFilter as PrismaWhereFilter,
} from '.././../';

describe('lb4ToPrismaFilter()', () => {
  it('throw with `fields` and `include` are present', () => {
    const lb4Filter: Filter = {
      fields: ['fieldA', 'fieldB', 'fieldC'],
      include: ['relationA', 'relationB', 'relationC'],
    };

    expect(() => lb4ToPrismaFilter(lb4Filter)).to.throw();
  });

  describe('`fields` parsing', () => {
    it('parses array `fields`', () => {
      const lb4Filter: Filter = {
        fields: ['fieldA', 'fieldB', 'fieldC'],
      };

      const prismaFilter: PrismaFilter = {
        select: {
          fieldA: true,
          fieldB: true,
          fieldC: true,
        },
      };

      const testResult = lb4ToPrismaFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });

    it('parses key-value `fields`', () => {
      const lb4Filter: Filter = {
        fields: {
          fieldA: true,
          fieldB: false,
          fieldC: true,
        },
      };

      const prismaFilter: PrismaFilter = {
        select: {
          fieldA: true,
          fieldB: false,
          fieldC: true,
        },
      };

      const testResult = lb4ToPrismaFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  describe('`include` parsing', () => {
    it('parses simplified `include`', () => {
      const lb4Filter: Filter = {
        include: ['relationA', 'relationB', 'relationC'],
      };

      const prismaFilter: PrismaFilter = {
        include: {
          relationA: true,
          relationB: true,
          relationC: true,
        },
      };

      const testResult = lb4ToPrismaFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });

    it('parses expanded `include`', () => {
      const lb4Filter: Filter = {
        include: [
          {
            relation: 'relationA',
          },
          {
            relation: 'relationB',
            scope: {
              fields: ['fieldA', 'fieldB', 'fieldC'],
            },
          },
          {
            relation: 'relationC',
            scope: {
              fields: {
                fieldA: true,
                fieldB: false,
                fieldC: false,
              },
            },
          },
        ],
      };

      const prismaFilter: PrismaFilter = {
        include: {
          relationA: true,
          relationB: {
            select: {
              fieldA: true,
              fieldB: true,
              fieldC: true,
            },
          },
          relationC: {
            select: {
              fieldA: true,
              fieldB: false,
              fieldC: false,
            },
          },
        },
      };

      const testResult = lb4ToPrismaFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });
});

describe('lb4toPrismaWhereFilter()', () => {
  it('parses `equals`', () => {
    const lb4Filter: Where = {
      and: [
        {
          propA: {
            eq: 'valueA',
          },
        },
        {
          propB: {
            eq: 'valueB',
          },
        },
        {
          propC: {
            eq: 'valueC',
          },
        },
      ],
    };

    const prismaFilter: PrismaWhereFilter = {
      AND: [
        {
          propA: {
            equals: 'valueA',
          },
        },
        {
          propB: {
            equals: 'valueB',
          },
        },
        {
          propC: {
            equals: 'valueC',
          },
        },
      ],
    };

    const testResult = lb4ToPrismaWhereFilter(lb4Filter);

    expect(testResult).to.deepEqual(prismaFilter);
  });
});
