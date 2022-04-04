// SPDX-FileCopyrightNotice: LoopBack Contributors
// SPDX-License-Identifier: MIT
// Node module: @loopback/prisma

import {Filter, Where} from '@loopback/repository';
import {expect, sinon} from '@loopback/testlab';
import {
  PrismaFilterConflictError,
  PrismaFilterInvalidLB4DirectionError,
  PrismaFilterUnsupportedLB4FilterOperatorError
} from '../../errors';
import {
  Filter as PrismaFilter,
  lb4ToPrismaFilter,
  lb4ToPrismaWhereFilter,
  WhereFilter as PrismaWhereFilter
} from '.././../';

describe('lb4ToPrismaFilter()', () => {
  afterEach(() => {
    sinon.reset();
    sinon.restore();
  });

  // describe('`lb4ToPrismaWhereFilter` error surfacing', () => {
  //   const lb4ToPrismaWhereFilterErrors = [PrismaFilterConflictError, PrismaFilterUnsupportedLB4FilterOperatorError];

  //   for (const error of lb4ToPrismaWhereFilterErrors) {
  //     it(`surfaces \`${error.name}\` from \`lb4ToPrismaWhereFilter\``, () => {
  //       const lb4Filter: Filter = {
  //         where: {}
  //       }

  //       const stub = sinon.stub(selfModule, 'lb4ToPrismaWhereFilter').throws(new error('lb4'));
  //       expect(() => selfModule.lb4ToPrismaFilter(lb4Filter)).to.throw(error);
  //     });
  //   }
  // });

  it('throws when `fields` and `include` are present', () => {
    const lb4Filter: Filter = {
      fields: ['fieldA', 'fieldB', 'fieldC'],
      include: ['relationA', 'relationB', 'relationC'],
    };

    expect(() => lb4ToPrismaFilter(lb4Filter)).to.throw(
      PrismaFilterConflictError,
    );
  });

  describe('`order` parsing', () => {
    it('throws when invalid order direction is provided', () => {
      const lb4Filter: Filter = {
        order: ['propA invalidDirection'],
      };

      expect(() => lb4ToPrismaFilter(lb4Filter)).to.throw(
        PrismaFilterInvalidLB4DirectionError,
      );
    });

    it('parses `order`', () => {
      const lb4Filter: Filter = {
        order: ['propA', 'propB DESC', 'propC ASC'],
      };

      const prismaFilter: PrismaFilter = {
        orderBy: [{propA: 'asc'}, {propB: 'desc'}, {propC: 'asc'}],
      };

      const testResult = lb4ToPrismaFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });

    it('parses single `order` with simpler syntax', () => {
      const lb4Filter: Filter = {
        order: ['propA ASC'],
      };

      const prismaFilter: PrismaFilter = {
        orderBy: {
          propA: 'asc',
        },
      };

      const testResult = lb4ToPrismaFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
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
            // Simple relation inclusion
            relation: 'relationA',
          },
          {
            // Relation inclusion with array `fields` scope
            relation: 'relationB',
            scope: {
              fields: ['fieldA', 'fieldB', 'fieldC'],
            },
          },
          {
            // Relation inclusion with key-value `fields` scope
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

  // describe('`where` filtering', () => {
  //   it('calls `lb4ToPrismaWhereFilter` with the expected arguments', async () => {
  //     const lb4Filter: Filter = {
  //       where: {
  //         propA: 'a',
  //         propB: {
  //           eq: 'b',
  //         },
  //         propC: {
  //           gt: 52,
  //         },
  //       },
  //     };

  //     const stub = sinon.stub(selfModule, 'lb4ToPrismaWhereFilter');
  //     selfModule.lb4ToPrismaFilter(lb4Filter);

  //     expect(stub.calledOnceWithExactly(lb4Filter.where!)).to.be.true();
  //   });
  // });
});

describe('lb4toPrismaWhereFilter()', () => {
  it('throws when `and`, `or` and model properties are present at the root filter level', () => {
    const lb4Filter: Where = {
      and: [],
      or: [],
      propA: '',
    };

    expect(() => lb4ToPrismaWhereFilter(lb4Filter)).to.throw(
      PrismaFilterConflictError,
    );
  });

  it('throws when an unknown operator is present by default', () => {
    const lb4Filter: Where = {
      propA: {
        customOperator: '',
      },
    };

    expect(() => lb4ToPrismaWhereFilter(lb4Filter)).to.throw(
      PrismaFilterUnsupportedLB4FilterOperatorError,
    );
  });

  describe('`eq` parsing', () => {
    const dateInst = new Date();

    const values = ['valueA', 23, false, dateInst];

    for (const value of values) {
      it(`parses \`eq\` with value '${value}'`, () => {
        const lb4Filter: Where = {
          prop: {
            eq: value,
          },
        };

        const prismaFilter: PrismaWhereFilter = {
          prop: {
            equals: value,
          },
        };

        const testResult = lb4ToPrismaWhereFilter(lb4Filter);
        expect(testResult).to.deepEqual(prismaFilter);
      });
    }

    it('parses `eq` for all value types', () => {
      const lb4Filter: Where = {
        and: values.map((v, i) => {
          return {[`prop${i}`]: {eq: v}};
        }),
      };

      const prismaFilter: PrismaWhereFilter = {
        AND: values.map((v, i) => {
          return {[`prop${i}`]: {equals: v}};
        }),
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  describe('shorthand `eq` parsing', () => {
    const dateInst = new Date();

    const values = ['valueA', 23, false, dateInst];

    for (const value of values) {
      it(`parses shorthand \`eq\` with value '${value}'`, () => {
        const lb4Filter: Where = {
          prop: value,
        };

        const prismaFilter: PrismaWhereFilter = {
          prop: value,
        };

        const testResult = lb4ToPrismaWhereFilter(lb4Filter);
        expect(testResult).to.deepEqual(prismaFilter);
      });
    }

    it('parses shorthand `eq` for all value types', () => {
      const lb4Filter: Where = {
        and: values.map((v, i) => {
          return {[`prop${i}`]: v};
        }),
      };

      const prismaFilter: PrismaWhereFilter = {
        AND: values.map((v, i) => {
          return {[`prop${i}`]: v};
        }),
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  describe('`neq` parsing', () => {
    const dateInst = new Date();

    const values = ['valueA', 23, false, dateInst];

    for (const value of values) {
      it(`parses \`neq\` with value '${value}'`, () => {
        const lb4Filter: Where = {
          prop: {
            neq: value,
          },
        };

        const prismaFilter: PrismaWhereFilter = {
          prop: {
            not: value,
          },
        };

        const testResult = lb4ToPrismaWhereFilter(lb4Filter);
        expect(testResult).to.deepEqual(prismaFilter);
      });
    }

    it('parses `neq` for all value types', () => {
      const lb4Filter: Where = {
        and: values.map((v, i) => {
          return {[`prop${i}`]: {neq: v}};
        }),
      };

      const prismaFilter: PrismaWhereFilter = {
        AND: values.map((v, i) => {
          return {[`prop${i}`]: {not: v}};
        }),
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  describe('`match` parsing', () => {
    it('parses `match` for string values', () => {
      const lb4Filter: Where = {
        propA: {
          match: 'fox & zebra',
        },
      };

      const prismaFilter: PrismaWhereFilter = {
        propA: {
          search: 'fox & zebra',
        },
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  const numOperators = ['lt', 'lte', 'gt', 'gte'];

  for (const op of numOperators) {
    describe(`\`${op}\` parsing`, () => {
      const dateInst = new Date();

      const values = [23, -60, 50.34567, -12.54325, dateInst];

      for (const value of values) {
        it(`parses \`${op}\` with value '${value}'`, () => {
          const lb4Filter: Where = {
            prop: {
              [op]: value,
            },
          };

          const prismaFilter: PrismaWhereFilter = {
            prop: {
              [op]: value,
            },
          };

          const testResult = lb4ToPrismaWhereFilter(lb4Filter);
          expect(testResult).to.deepEqual(prismaFilter);
        });
      }

      it(`parses \`${op}\` for all value types`, () => {
        const lb4Filter: Where = {
          and: values.map((v, i) => {
            return {[`prop${i}`]: {neq: v}};
          }),
        };

        const prismaFilter: PrismaWhereFilter = {
          AND: values.map((v, i) => {
            return {[`prop${i}`]: {not: v}};
          }),
        };

        const testResult = lb4ToPrismaWhereFilter(lb4Filter);
        expect(testResult).to.deepEqual(prismaFilter);
      });
    });
  }

  describe('`between` parsing', () => {
    const dateInst = new Date();

    const values = [23, -60, 50.34567, -12.54325, dateInst];

    for (const value of values) {
      it(`parses \`between\` with value '${value}'`, () => {
        const lb4Filter: Where = {
          prop: {
            neq: value,
          },
        };

        const prismaFilter: PrismaWhereFilter = {
          prop: {
            not: value,
          },
        };

        const testResult = lb4ToPrismaWhereFilter(lb4Filter);
        expect(testResult).to.deepEqual(prismaFilter);
      });
    }

    it('parses `between` for all value types', () => {
      const lb4Filter: Where = {
        and: values.map((v, i) => {
          return {[`prop${i}`]: {neq: v}};
        }),
      };

      const prismaFilter: PrismaWhereFilter = {
        AND: values.map((v, i) => {
          return {[`prop${i}`]: {not: v}};
        }),
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  describe('`inq` parsing', () => {
    const dateInst = new Date();

    const value = ['valueA', 23, false, dateInst];

    it('parses `inq`', () => {
      const lb4Filter: Where = {
        prop: {
          inq: value,
        },
      };

      const prismaFilter: PrismaWhereFilter = {
        prop: {
          in: value,
        },
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });

  describe('`nin` parsing', () => {
    const dateInst = new Date();

    const value = ['valueA', 23, false, dateInst];

    it('parses `nin`', () => {
      const lb4Filter: Where = {
        prop: {
          nin: value,
        },
      };

      const prismaFilter: PrismaWhereFilter = {
        NOT: {
          prop: {
            in: value,
          },
        },
      };

      const testResult = lb4ToPrismaWhereFilter(lb4Filter);
      expect(testResult).to.deepEqual(prismaFilter);
    });
  });
});
