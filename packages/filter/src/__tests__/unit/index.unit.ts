// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/filter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as filterModule from '../..';

describe('Index exports - Unit Tests', () => {
  it('exports WhereBuilder', () => {
    expect(filterModule.WhereBuilder).to.be.a.Function();
    expect(filterModule.WhereBuilder.name).to.equal('WhereBuilder');
  });

  it('exports FilterBuilder', () => {
    expect(filterModule.FilterBuilder).to.be.a.Function();
    expect(filterModule.FilterBuilder.name).to.equal('FilterBuilder');
  });

  it('exports isFilter function', () => {
    expect(filterModule.isFilter).to.be.a.Function();
    expect(filterModule.isFilter.name).to.equal('isFilter');
  });

  it('exports filterTemplate function', () => {
    expect(filterModule.filterTemplate).to.be.a.Function();
    expect(filterModule.filterTemplate.name).to.equal('filterTemplate');
  });

  it('can instantiate WhereBuilder', () => {
    const builder = new filterModule.WhereBuilder();
    expect(builder).to.be.instanceOf(filterModule.WhereBuilder);
    expect(builder.where).to.eql({});
  });

  it('can instantiate FilterBuilder', () => {
    const builder = new filterModule.FilterBuilder();
    expect(builder).to.be.instanceOf(filterModule.FilterBuilder);
    expect(builder.filter).to.eql({});
  });

  it('can use isFilter', () => {
    const result = filterModule.isFilter({where: {name: 'John'}});
    expect(result).to.be.true();
  });

  it('can use filterTemplate', () => {
    const template = filterModule.filterTemplate`{"limit": ${'limit'}}`;
    const result = template({limit: 10});
    expect(result).to.eql({limit: 10});
  });

  describe('Type exports', () => {
    it('provides type definitions for Where', () => {
      // This test verifies that the types are available at compile time
      // Runtime check is not possible for types
      const where: filterModule.Where = {name: 'John'};
      expect(where).to.eql({name: 'John'});
    });

    it('provides type definitions for Filter', () => {
      const filter: filterModule.Filter = {
        where: {name: 'John'},
        limit: 10,
      };
      expect(filter).to.eql({where: {name: 'John'}, limit: 10});
    });

    it('provides type definitions for Condition', () => {
      const condition: filterModule.Condition<{name: string; age: number}> = {
        name: 'John',
        age: {gt: 25},
      };
      expect(condition).to.eql({name: 'John', age: {gt: 25}});
    });

    it('provides type definitions for AndClause', () => {
      const andClause: filterModule.AndClause<{name: string}> = {
        and: [{name: 'John'}, {name: 'Jane'}],
      };
      expect(andClause).to.eql({and: [{name: 'John'}, {name: 'Jane'}]});
    });

    it('provides type definitions for OrClause', () => {
      const orClause: filterModule.OrClause<{name: string}> = {
        or: [{name: 'John'}, {name: 'Jane'}],
      };
      expect(orClause).to.eql({or: [{name: 'John'}, {name: 'Jane'}]});
    });

    it('provides type definitions for PredicateComparison', () => {
      const predicate: filterModule.PredicateComparison<number> = {
        gt: 10,
        lt: 100,
      };
      expect(predicate).to.eql({gt: 10, lt: 100});
    });

    it('provides type definitions for Order', () => {
      const order: filterModule.Order<{name: string; age: number}> = {
        name: 'ASC',
        age: 'DESC',
      };
      expect(order).to.eql({name: 'ASC', age: 'DESC'});
    });

    it('provides type definitions for Fields', () => {
      const fields: filterModule.Fields<{name: string; age: number}> = {
        name: true,
        age: false,
      };
      expect(fields).to.eql({name: true, age: false});
    });

    it('provides type definitions for Inclusion', () => {
      const inclusion: filterModule.Inclusion = {
        relation: 'orders',
        scope: {limit: 10},
      };
      expect(inclusion).to.eql({relation: 'orders', scope: {limit: 10}});
    });

    it('provides type definitions for FilterExcludingWhere', () => {
      const filter: filterModule.FilterExcludingWhere = {
        limit: 10,
        offset: 5,
        order: ['name ASC'],
      };
      expect(filter).to.eql({limit: 10, offset: 5, order: ['name ASC']});
    });
  });

  describe('Integration with builders', () => {
    it('WhereBuilder and FilterBuilder work together', () => {
      const whereBuilder = new filterModule.WhereBuilder();
      const where = whereBuilder.eq('name', 'John').gt('age', 25).build();

      const filterBuilder = new filterModule.FilterBuilder();
      const filter = filterBuilder.where(where).limit(10).build();

      expect(filter).to.eql({
        where: {name: 'John', age: {gt: 25}},
        limit: 10,
      });
    });

    it('isFilter validates FilterBuilder output', () => {
      const filterBuilder = new filterModule.FilterBuilder();
      const filter = filterBuilder
        .where({name: 'John'})
        .limit(10)
        .offset(5)
        .build();

      expect(filterModule.isFilter(filter)).to.be.true();
    });

    it('filterTemplate creates valid filters', () => {
      const template = filterModule.filterTemplate`{
        "where": {"name": ${'name'}},
        "limit": ${'limit'}
      }`;
      const filter = template({name: 'John', limit: 10});

      expect(filterModule.isFilter(filter)).to.be.true();
      expect(filter).to.eql({where: {name: 'John'}, limit: 10});
    });
  });

  describe('Module structure', () => {
    it('exports all expected members', () => {
      const expectedExports = [
        'WhereBuilder',
        'FilterBuilder',
        'isFilter',
        'filterTemplate',
      ];

      for (const exportName of expectedExports) {
        expect(filterModule).to.have.property(exportName);
      }
    });

    it('does not export unexpected members', () => {
      // Check that internal implementation details are not exported
      const exportedKeys = Object.keys(filterModule);

      // These should be the main exports
      const allowedExports = [
        'WhereBuilder',
        'FilterBuilder',
        'isFilter',
        'filterTemplate',
      ];

      // All exported keys should be in the allowed list or be type-only exports
      for (const key of exportedKeys) {
        expect(allowedExports).to.containEql(key);
      }
    });
  });
});

// Made with Bob
