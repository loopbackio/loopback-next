// Copyright IBM Corp. and LoopBack contributors 2019,2026. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  constrainDataObject,
  constrainDataObjects,
  constrainFilter,
  constrainWhere,
  constrainWhereOr,
  Entity,
  Filter,
  FilterBuilder,
  Where,
} from '../../..';

describe('constraint utility functions', () => {
  context('constrainFilter', () => {
    const inputFilter = filterBuilderHelper({
      fields: {a: true},
      where: {x: 'x'},
      limit: 5,
    });

    it('applies a where constraint', () => {
      const constraint = {id: '5'};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: Object.assign({}, inputFilter.where, constraint),
      });
    });
    it('applies a filter constraint with where object', () => {
      const constraint: Filter = {where: {id: '10'}};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: Object.assign({}, inputFilter.where, constraint.where),
      });
    });

    it('applies a filter constraint with duplicate key in where object', () => {
      const constraint: Filter = {where: {x: 'z'}};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: {and: [inputFilter.where, constraint.where]},
      });
    });

    it('does not apply filter constraint with unsupported fields', () => {
      const constraint: Filter = {
        fields: {b: false},
        where: {name: 'John'},
      };
      expect(() => {
        constrainFilter(inputFilter, constraint);
      }).to.throw(/not implemented/);
    });
  });
  context('constrainWhere', () => {
    const inputWhere: Where<{x: string; y: string; id: string}> = {
      x: 'x',
      y: 'y',
    };

    it('enforces a constraint', () => {
      const constraint = {id: '5'};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.deepEqual(Object.assign({}, inputWhere, constraint));
    });

    it('enforces constraint with dup key', () => {
      const constraint = {y: 'z'};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.deepEqual({
        and: [inputWhere, constraint],
      });
    });
  });

  context('constrainWhereOr', () => {
    const inputWhere: Where<{x: string; y: string; id: string}> = {
      x: 'x',
    };
    it('enforces a constraint', () => {
      const constraint = [{id: '5'}, {y: 'y'}];
      const result = constrainWhereOr(inputWhere, constraint);
      expect(result).to.deepEqual({...inputWhere, or: constraint});
    });

    it('enforces constraint with dup key', () => {
      const constraint = [{y: 'z'}, {x: 'z'}];
      const result = constrainWhereOr(inputWhere, constraint);
      expect(result).to.deepEqual({...inputWhere, or: constraint});
    });
  });

  context('constrainDataObject', () => {
    it('constrains a single data object', () => {
      const input = new Order({description: 'order 1'});
      const constraint: Partial<Order> = {id: 2};
      expect(constrainDataObject(input, constraint)).to.containDeep({
        description: 'order 1',
        id: 2,
      });
    });

    it('throws error when the query changes field in constraint', () => {
      const input = new Order({id: 1, description: 'order 1'});
      const constraint: Partial<Order> = {id: 2};
      expect(() => {
        constrainDataObject(input, constraint);
      }).to.throwError(/Property "id" cannot be changed!/);
    });

    it('allows constrained fields with the same values', () => {
      const input = new Order({id: 2, description: 'order 1'});
      const constraint: Partial<Order> = {id: 2};
      const result = constrainDataObject(input, constraint);
      expect(result).to.deepEqual(
        new Order({
          id: 2,
          description: 'order 1',
        }),
      );
    });
  });

  describe('constrainDataObjects', () => {
    it('constrains array of data objects', () => {
      const input = [
        new Order({description: 'order 1'}),
        new Order({description: 'order 2'}),
      ];
      const constraint: Partial<Order> = {id: 3};
      const result = constrainDataObjects(input, constraint);
      expect(result[0]).to.containDeep(Object.assign({}, input[0], constraint));
      expect(result[1]).to.containDeep(Object.assign({}, input[1], constraint));
    });

    it('throws error when the query changes field in constraint', () => {
      const input = [new Order({id: 1, description: 'order 1'})];
      const constraint: Partial<Order> = {id: 2};
      expect(() => {
        constrainDataObjects(input, constraint);
      }).to.throwError(/Property "id" cannot be changed!/);
    });

    it('allows constrained fields with the same values', () => {
      const input = [new Order({id: 2, description: 'order 1'})];
      const constraint: Partial<Order> = {id: 2};
      const result = constrainDataObjects(input, constraint);
      expect(result).to.deepEqual([
        new Order({
          id: 2,
          description: 'order 1',
        }),
      ]);
    });
  });

  describe('additional edge cases', () => {
    it('constrainFilter handles undefined input filter', () => {
      const constraint = {id: '5'};
      const result = constrainFilter(undefined, constraint);
      expect(result).to.containEql({where: constraint});
    });

    it('constrainWhere handles undefined input where', () => {
      const constraint = {id: '5'};
      const result = constrainWhere(undefined, constraint);
      expect(result).to.deepEqual(constraint);
    });

    it('constrainWhere handles empty constraint', () => {
      const inputWhere = {x: 'x'};
      const constraint = {};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.deepEqual(inputWhere);
    });

    it('constrainWhereOr handles undefined input where', () => {
      const constraint = [{id: '5'}, {y: 'y'}];
      const result = constrainWhereOr(undefined, constraint);
      expect(result).to.deepEqual({or: constraint});
    });

    it('constrainWhereOr handles empty constraint array', () => {
      const inputWhere = {x: 'x'};
      const constraint: Where<{x: string}>[] = [];
      const result = constrainWhereOr(inputWhere, constraint);
      expect(result).to.deepEqual({...inputWhere, or: constraint});
    });

    it('constrainDataObject handles empty constraint', () => {
      const input = new Order({id: 1, description: 'order 1'});
      const constraint: Partial<Order> = {};
      const result = constrainDataObject(input, constraint);
      expect(result).to.deepEqual(input);
    });

    it('constrainDataObjects handles empty array', () => {
      const input: Order[] = [];
      const constraint: Partial<Order> = {id: 2};
      const result = constrainDataObjects(input, constraint);
      expect(result).to.deepEqual([]);
    });

    it('constrainDataObject preserves nested objects', () => {
      class ComplexOrder extends Entity {
        id: number;
        metadata: {tags: string[]; priority: number};
        constructor(data?: Partial<ComplexOrder>) {
          super(data);
        }
      }
      const input = new ComplexOrder({
        id: 1,
        metadata: {tags: ['urgent'], priority: 1},
      });
      const constraint: Partial<ComplexOrder> = {id: 1};
      const result = constrainDataObject(input, constraint);
      expect(result.metadata).to.deepEqual({tags: ['urgent'], priority: 1});
    });

    it('constrainFilter with multiple constraints', () => {
      const inputFilter = filterBuilderHelper({where: {x: 'x'}});
      const constraint = {id: '5', status: 'active'};
      const result = constrainFilter(inputFilter, constraint);
      expect(result.where).to.containEql(constraint);
    });

    it('constrainWhere with nested where conditions', () => {
      const inputWhere: Where<{x: string; y: string; id: string}> = {
        and: [{x: 'x'}, {y: 'y'}],
      };
      const constraint = {id: '5'};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.have.property('id', '5');
    });
  });

  /*---------------HELPERS----------------*/

  function filterBuilderHelper(filter: Filter) {
    const builder = new FilterBuilder();
    for (const key in filter) {
      switch (key) {
        case 'fields':
          builder.fields(filter[key]!);
          break;
        case 'where':
          builder.where(filter[key]!);
          break;
        case 'limit':
          builder.limit(filter[key]!);
          break;
        default:
          throw Error('unsupported filter fields');
      }
    }
    return builder.build();
  }

  class Order extends Entity {
    id: number;
    description: string;
    customerId: number;

    constructor(data?: Partial<Order>) {
      super(data);
    }
  }
});
