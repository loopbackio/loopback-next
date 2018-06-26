// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  FilterBuilder,
  Filter,
  Where,
  WhereBuilder,
  constrainFilter,
  constrainWhere,
  constrainDataObject,
  constrainDataObjects,
  Entity,
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
    const inputWhere = whereBuilderHelper({x: 'x', y: 'y'});

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

  context('constrainDataObject', () => {
    it('constrains a single data object', () => {
      const input = new Order({description: 'order 1'});
      const constraint: Partial<Order> = {id: 2};
      expect(constrainDataObject(input, constraint)).to.containDeep({
        description: 'order 1',
        id: 2,
      });
    });

    it('throws error when the query changes field in constrain', () => {
      const input = new Order({id: 1, description: 'order 1'});
      const constraint: Partial<Order> = {id: 2};
      expect(() => {
        constrainDataObject(input, constraint);
      }).to.throwError(/Property "id" cannot be changed!/);
    });

    it('constrains array of data objects', () => {
      const input = [
        new Order({id: 1, description: 'order 1'}),
        new Order({id: 2, description: 'order 2'}),
      ];
      const constraint: Partial<Order> = {id: 3};
      const result = constrainDataObjects(input, constraint);
      expect(result[0]).to.containDeep(Object.assign({}, input[0], constraint));
      expect(result[1]).to.containDeep(Object.assign({}, input[1], constraint));
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

  function whereBuilderHelper(where: Where) {
    const builder = new WhereBuilder();
    for (const key in where) {
      builder.eq(key, where[key]);
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
