// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/filter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {FilterBuilder, filterTemplate, isFilter, WhereBuilder} from '../..';
import {AnyObject} from '../../types';

describe('WhereBuilder - Unit Tests', () => {
  describe('constructor', () => {
    it('creates an empty where object when no argument is provided', () => {
      const builder = new WhereBuilder();
      expect(builder.where).to.eql({});
    });

    it('creates a where object from an existing where clause', () => {
      const existingWhere = {name: 'John', age: {gt: 25}};
      const builder = new WhereBuilder(existingWhere);
      expect(builder.where).to.eql(existingWhere);
    });
  });

  describe('eq', () => {
    it('adds an equality condition', () => {
      const builder = new WhereBuilder();
      builder.eq('name', 'John');
      expect(builder.build()).to.eql({name: 'John'});
    });

    it('adds multiple equality conditions', () => {
      const builder = new WhereBuilder();
      builder.eq('name', 'John').eq('age', 30);
      expect(builder.build()).to.eql({name: 'John', age: 30});
    });

    it('handles boolean values', () => {
      const builder = new WhereBuilder();
      builder.eq('active', true);
      expect(builder.build()).to.eql({active: true});
    });

    it('handles Date values', () => {
      const date = new Date('2020-01-01');
      const builder = new WhereBuilder();
      builder.eq('createdAt', date);
      expect(builder.build()).to.eql({createdAt: date});
    });
  });

  describe('neq', () => {
    it('adds a not-equal condition', () => {
      const builder = new WhereBuilder();
      builder.neq('status', 'inactive');
      expect(builder.build()).to.eql({status: {neq: 'inactive'}});
    });

    it('chains with other conditions', () => {
      const builder = new WhereBuilder();
      builder.eq('name', 'John').neq('status', 'inactive');
      expect(builder.build()).to.eql({
        name: 'John',
        status: {neq: 'inactive'},
      });
    });
  });

  describe('gt', () => {
    it('adds a greater-than condition', () => {
      const builder = new WhereBuilder();
      builder.gt('age', 18);
      expect(builder.build()).to.eql({age: {gt: 18}});
    });
  });

  describe('gte', () => {
    it('adds a greater-than-or-equal condition', () => {
      const builder = new WhereBuilder();
      builder.gte('age', 18);
      expect(builder.build()).to.eql({age: {gte: 18}});
    });
  });

  describe('lt', () => {
    it('adds a less-than condition', () => {
      const builder = new WhereBuilder();
      builder.lt('age', 65);
      expect(builder.build()).to.eql({age: {lt: 65}});
    });
  });

  describe('lte', () => {
    it('adds a less-than-or-equal condition', () => {
      const builder = new WhereBuilder();
      builder.lte('age', 65);
      expect(builder.build()).to.eql({age: {lte: 65}});
    });
  });

  describe('inq', () => {
    it('adds an IN condition with array of values', () => {
      const builder = new WhereBuilder();
      builder.inq('status', ['active', 'pending']);
      expect(builder.build()).to.eql({status: {inq: ['active', 'pending']}});
    });

    it('handles numeric arrays', () => {
      const builder = new WhereBuilder();
      builder.inq('id', [1, 2, 3]);
      expect(builder.build()).to.eql({id: {inq: [1, 2, 3]}});
    });

    it('handles empty arrays', () => {
      const builder = new WhereBuilder();
      builder.inq('status', []);
      expect(builder.build()).to.eql({status: {inq: []}});
    });
  });

  describe('nin', () => {
    it('adds a NOT IN condition', () => {
      const builder = new WhereBuilder();
      builder.nin('status', ['deleted', 'archived']);
      expect(builder.build()).to.eql({status: {nin: ['deleted', 'archived']}});
    });
  });

  describe('between', () => {
    it('adds a BETWEEN condition with numeric values', () => {
      const builder = new WhereBuilder();
      builder.between('age', 18, 65);
      expect(builder.build()).to.eql({age: {between: [18, 65]}});
    });

    it('adds a BETWEEN condition with string values', () => {
      const builder = new WhereBuilder();
      builder.between('name', 'A', 'M');
      expect(builder.build()).to.eql({name: {between: ['A', 'M']}});
    });

    it('adds a BETWEEN condition with Date values', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2020-12-31');
      const builder = new WhereBuilder();
      builder.between('createdAt', start, end);
      expect(builder.build()).to.eql({createdAt: {between: [start, end]}});
    });
  });

  describe('exists', () => {
    it('adds an EXISTS condition with true', () => {
      const builder = new WhereBuilder();
      builder.exists('email', true);
      expect(builder.build()).to.eql({email: {exists: true}});
    });

    it('adds an EXISTS condition with false', () => {
      const builder = new WhereBuilder();
      builder.exists('email', false);
      expect(builder.build()).to.eql({email: {exists: false}});
    });

    it('defaults to true when no value is provided', () => {
      const builder = new WhereBuilder();
      builder.exists('email');
      expect(builder.build()).to.eql({email: {exists: true}});
    });
  });

  describe('like', () => {
    it('adds a LIKE condition', () => {
      const builder = new WhereBuilder();
      builder.like('name', '%John%');
      expect(builder.build()).to.eql({name: {like: '%John%'}});
    });
  });

  describe('nlike', () => {
    it('adds a NOT LIKE condition', () => {
      const builder = new WhereBuilder();
      builder.nlike('name', '%test%');
      expect(builder.build()).to.eql({name: {nlike: '%test%'}});
    });
  });

  describe('ilike', () => {
    it('adds an ILIKE condition', () => {
      const builder = new WhereBuilder();
      builder.ilike('name', '%john%');
      expect(builder.build()).to.eql({name: {ilike: '%john%'}});
    });
  });

  describe('nilike', () => {
    it('adds a NOT ILIKE condition', () => {
      const builder = new WhereBuilder();
      builder.nilike('name', '%test%');
      expect(builder.build()).to.eql({name: {nilike: '%test%'}});
    });
  });

  describe('regexp', () => {
    it('adds a REGEXP condition with string', () => {
      const builder = new WhereBuilder();
      builder.regexp('email', '^[a-z]+@example.com$');
      expect(builder.build()).to.eql({
        email: {regexp: '^[a-z]+@example.com$'},
      });
    });

    it('adds a REGEXP condition with RegExp object', () => {
      const builder = new WhereBuilder();
      const pattern = /^[a-z]+@example.com$/;
      builder.regexp('email', pattern);
      expect(builder.build()).to.eql({email: {regexp: pattern}});
    });
  });

  describe('and', () => {
    it('adds an AND clause with single condition', () => {
      const builder = new WhereBuilder();
      builder.and({name: 'John'});
      expect(builder.build()).to.eql({and: [{name: 'John'}]});
    });

    it('adds an AND clause with multiple conditions', () => {
      const builder = new WhereBuilder();
      builder.and({name: 'John'}, {age: {gt: 25}});
      expect(builder.build()).to.eql({
        and: [{name: 'John'}, {age: {gt: 25}}],
      });
    });

    it('adds an AND clause with array of conditions', () => {
      const builder = new WhereBuilder();
      builder.and([{name: 'John'}, {age: {gt: 25}}]);
      expect(builder.build()).to.eql({
        and: [{name: 'John'}, {age: {gt: 25}}],
      });
    });

    it('flattens nested arrays in AND clause', () => {
      const builder = new WhereBuilder();
      builder.and({name: 'John'}, [{age: {gt: 25}}, {status: 'active'}]);
      expect(builder.build()).to.eql({
        and: [{name: 'John'}, {age: {gt: 25}}, {status: 'active'}],
      });
    });

    it('creates nested AND when called multiple times', () => {
      const builder = new WhereBuilder();
      builder
        .eq('id', 1)
        .and({name: 'John'})
        .and({age: {gt: 25}});
      expect(builder.build()).to.eql({
        and: [{id: 1, and: [{name: 'John'}]}, {and: [{age: {gt: 25}}]}],
      });
    });
  });

  describe('or', () => {
    it('adds an OR clause with single condition', () => {
      const builder = new WhereBuilder();
      builder.or({name: 'John'});
      expect(builder.build()).to.eql({or: [{name: 'John'}]});
    });

    it('adds an OR clause with multiple conditions', () => {
      const builder = new WhereBuilder();
      builder.or({name: 'John'}, {name: 'Jane'});
      expect(builder.build()).to.eql({
        or: [{name: 'John'}, {name: 'Jane'}],
      });
    });

    it('adds an OR clause with array of conditions', () => {
      const builder = new WhereBuilder();
      builder.or([{name: 'John'}, {name: 'Jane'}]);
      expect(builder.build()).to.eql({
        or: [{name: 'John'}, {name: 'Jane'}],
      });
    });

    it('combines with other conditions', () => {
      const builder = new WhereBuilder();
      builder.eq('status', 'active').or({name: 'John'}, {name: 'Jane'});
      expect(builder.build()).to.eql({
        status: 'active',
        or: [{name: 'John'}, {name: 'Jane'}],
      });
    });
  });

  describe('impose', () => {
    it('imposes a where clause on empty builder', () => {
      const builder = new WhereBuilder();
      builder.impose({name: 'John', age: 30});
      expect(builder.build()).to.eql({name: 'John', age: 30});
    });

    it('merges non-conflicting keys', () => {
      const builder = new WhereBuilder({name: 'John'});
      builder.impose({age: 30});
      expect(builder.build()).to.eql({name: 'John', age: 30});
    });

    it('creates AND clause for conflicting keys', () => {
      const builder = new WhereBuilder({name: 'John'});
      builder.impose({name: 'Jane', age: 30});
      expect(builder.build()).to.eql({
        and: [{name: 'John'}, {name: 'Jane', age: 30}],
      });
    });

    it('handles null/undefined where clause', () => {
      const builder = new WhereBuilder();
      builder.impose({});
      expect(builder.build()).to.eql({});
    });
  });

  describe('cast (deprecated)', () => {
    it('casts AndClause to Where', () => {
      const builder = new WhereBuilder();
      const andClause = {and: [{name: 'John'}, {age: 30}]};
      const result = builder.cast(andClause);
      expect(result).to.equal(andClause);
    });

    it('casts OrClause to Where', () => {
      const builder = new WhereBuilder();
      const orClause = {or: [{name: 'John'}, {name: 'Jane'}]};
      const result = builder.cast(orClause);
      expect(result).to.equal(orClause);
    });

    it('casts Condition to Where', () => {
      const builder = new WhereBuilder();
      const condition = {name: 'John', age: {gt: 25}};
      const result = builder.cast(condition);
      expect(result).to.equal(condition);
    });
  });

  describe('build', () => {
    it('returns the constructed where object', () => {
      const builder = new WhereBuilder();
      builder.eq('name', 'John').gt('age', 25);
      const where = builder.build();
      expect(where).to.eql({name: 'John', age: {gt: 25}});
    });

    it('returns empty object when no conditions added', () => {
      const builder = new WhereBuilder();
      expect(builder.build()).to.eql({});
    });
  });

  describe('complex scenarios', () => {
    it('builds complex where with multiple operators', () => {
      const builder = new WhereBuilder();
      builder
        .eq('status', 'active')
        .gt('age', 18)
        .lt('age', 65)
        .inq('role', ['admin', 'user'])
        .like('email', '%@example.com');

      expect(builder.build()).to.eql({
        and: [
          {
            status: 'active',
            age: {gt: 18},
          },
          {age: {lt: 65}},
        ],
        role: {inq: ['admin', 'user']},
        email: {like: '%@example.com'},
      });
    });

    it('builds where with nested AND and OR', () => {
      const builder = new WhereBuilder();
      builder
        .eq('status', 'active')
        .and({age: {gt: 18}}, {age: {lt: 65}})
        .or({role: 'admin'}, {role: 'moderator'});

      expect(builder.build()).to.eql({
        status: 'active',
        and: [{age: {gt: 18}}, {age: {lt: 65}}],
        or: [{role: 'admin'}, {role: 'moderator'}],
      });
    });
  });
});

describe('FilterBuilder - Unit Tests', () => {
  describe('constructor', () => {
    it('creates an empty filter when no argument is provided', () => {
      const builder = new FilterBuilder();
      expect(builder.filter).to.eql({});
    });

    it('creates a filter from an existing filter object', () => {
      const existingFilter = {where: {name: 'John'}, limit: 10};
      const builder = new FilterBuilder(existingFilter);
      expect(builder.filter).to.eql(existingFilter);
    });
  });

  describe('limit', () => {
    it('sets the limit', () => {
      const builder = new FilterBuilder();
      builder.limit(10);
      expect(builder.build()).to.eql({limit: 10});
    });

    it('throws error for negative limit', () => {
      const builder = new FilterBuilder();
      expect(() => builder.limit(-5)).to.throw(/must a positive number/);
    });

    it('throws error for zero limit', () => {
      const builder = new FilterBuilder();
      expect(() => builder.limit(0)).to.throw(/must a positive number/);
    });

    it('allows limit of 1', () => {
      const builder = new FilterBuilder();
      builder.limit(1);
      expect(builder.build()).to.eql({limit: 1});
    });

    it('overwrites previous limit', () => {
      const builder = new FilterBuilder();
      builder.limit(10).limit(20);
      expect(builder.build()).to.eql({limit: 20});
    });
  });

  describe('offset', () => {
    it('sets the offset', () => {
      const builder = new FilterBuilder();
      builder.offset(5);
      expect(builder.build()).to.eql({offset: 5});
    });

    it('allows zero offset', () => {
      const builder = new FilterBuilder();
      builder.offset(0);
      expect(builder.build()).to.eql({offset: 0});
    });

    it('overwrites previous offset', () => {
      const builder = new FilterBuilder();
      builder.offset(5).offset(10);
      expect(builder.build()).to.eql({offset: 10});
    });
  });

  describe('skip', () => {
    it('sets the offset using skip alias', () => {
      const builder = new FilterBuilder();
      builder.skip(5);
      expect(builder.build()).to.eql({offset: 5});
    });

    it('is an alias for offset', () => {
      const builder1 = new FilterBuilder().skip(5);
      const builder2 = new FilterBuilder().offset(5);
      expect(builder1.build()).to.eql(builder2.build());
    });
  });

  describe('fields', () => {
    it('sets fields with string arguments', () => {
      const builder = new FilterBuilder();
      builder.fields('name', 'email');
      expect(builder.build()).to.eql({
        fields: {name: true, email: true},
      });
    });

    it('sets fields with array argument', () => {
      const builder = new FilterBuilder();
      builder.fields(['name', 'email']);
      expect(builder.build()).to.eql({
        fields: {name: true, email: true},
      });
    });

    it('sets fields with object argument', () => {
      const builder = new FilterBuilder();
      builder.fields({name: true, password: false});
      expect(builder.build()).to.eql({
        fields: {name: true, password: false},
      });
    });

    it('merges multiple field calls', () => {
      const builder = new FilterBuilder();
      builder.fields('name').fields('email').fields(['age']);
      expect(builder.build()).to.eql({
        fields: {name: true, email: true, age: true},
      });
    });

    it('handles mixed field types in single call', () => {
      const builder = new FilterBuilder();
      builder.fields('name', ['email', 'age'], {status: true});
      expect(builder.build()).to.eql({
        fields: {name: true, email: true, age: true, status: true},
      });
    });

    it('converts array fields to object on subsequent calls', () => {
      const builder = new FilterBuilder<AnyObject>({
        fields: ['name', 'email'],
      });
      builder.fields('age');
      expect(builder.build()).to.eql({
        fields: {name: true, email: true, age: true},
      });
    });

    it('overwrites field values', () => {
      const builder = new FilterBuilder();
      builder.fields({name: true}).fields({name: false});
      expect(builder.build()).to.eql({
        fields: {name: false},
      });
    });
  });

  describe('order', () => {
    it('sets order with string argument', () => {
      const builder = new FilterBuilder();
      builder.order('name');
      expect(builder.build()).to.eql({order: ['name ASC']});
    });

    it('sets order with explicit direction', () => {
      const builder = new FilterBuilder();
      builder.order('name DESC');
      expect(builder.build()).to.eql({order: ['name DESC']});
    });

    it('sets order with array argument', () => {
      const builder = new FilterBuilder();
      builder.order(['name', 'age DESC']);
      expect(builder.build()).to.eql({order: ['name ASC', 'age DESC']});
    });

    it('sets order with object argument', () => {
      const builder = new FilterBuilder();
      builder.order({name: 'ASC', age: 'DESC'});
      expect(builder.build()).to.eql({order: ['name ASC', 'age DESC']});
    });

    it('appends multiple order calls', () => {
      const builder = new FilterBuilder();
      builder.order('name').order('age DESC');
      expect(builder.build()).to.eql({order: ['name ASC', 'age DESC']});
    });

    it('handles mixed order types in single call', () => {
      const builder = new FilterBuilder();
      builder.order('name', ['age DESC'], {status: 'ASC'});
      expect(builder.build()).to.eql({
        order: ['name ASC', 'age DESC', 'status ASC'],
      });
    });

    it('throws error for invalid order format', () => {
      const builder = new FilterBuilder();
      expect(() => builder.order('name INVALID')).to.throw(/Invalid order/);
    });

    it('throws error for order with spaces in field name', () => {
      const builder = new FilterBuilder();
      expect(() => builder.order('first name ASC')).to.throw(/Invalid order/);
    });
  });

  describe('include', () => {
    it('sets include with string argument', () => {
      const builder = new FilterBuilder();
      builder.include('orders');
      expect(builder.build()).to.eql({
        include: [{relation: 'orders'}],
      });
    });

    it('sets include with array argument', () => {
      const builder = new FilterBuilder();
      builder.include(['orders', 'profile']);
      expect(builder.build()).to.eql({
        include: [{relation: 'orders'}, {relation: 'profile'}],
      });
    });

    it('sets include with Inclusion object', () => {
      const builder = new FilterBuilder();
      builder.include({relation: 'orders', scope: {limit: 5}});
      expect(builder.build()).to.eql({
        include: [{relation: 'orders', scope: {limit: 5}}],
      });
    });

    it('appends multiple include calls', () => {
      const builder = new FilterBuilder();
      builder.include('orders').include('profile');
      expect(builder.build()).to.eql({
        include: [{relation: 'orders'}, {relation: 'profile'}],
      });
    });

    it('handles mixed include types in single call', () => {
      const builder = new FilterBuilder();
      builder.include('orders', ['profile'], {
        relation: 'address',
        scope: {where: {active: true}},
      });
      expect(builder.build()).to.eql({
        include: [
          {relation: 'orders'},
          {relation: 'profile'},
          {relation: 'address', scope: {where: {active: true}}},
        ],
      });
    });
  });

  describe('where', () => {
    it('sets the where clause', () => {
      const builder = new FilterBuilder();
      builder.where({name: 'John'});
      expect(builder.build()).to.eql({where: {name: 'John'}});
    });

    it('overwrites previous where clause', () => {
      const builder = new FilterBuilder();
      builder.where({name: 'John'}).where({age: 30});
      expect(builder.build()).to.eql({where: {age: 30}});
    });

    it('handles complex where clause', () => {
      const builder = new FilterBuilder();
      builder.where({
        and: [{name: 'John'}, {age: {gt: 25}}],
        status: 'active',
      });
      expect(builder.build()).to.eql({
        where: {
          and: [{name: 'John'}, {age: {gt: 25}}],
          status: 'active',
        },
      });
    });
  });

  describe('impose', () => {
    it('imposes a where object as filter', () => {
      const builder = new FilterBuilder();
      builder.impose({name: 'John', age: 30});
      expect(builder.build()).to.eql({where: {name: 'John', age: 30}});
    });

    it('merges non-conflicting where clauses', () => {
      const builder = new FilterBuilder({where: {name: 'John'}});
      builder.impose({where: {age: 30}});
      expect(builder.build()).to.eql({where: {name: 'John', age: 30}});
    });

    it('creates AND for conflicting where clauses', () => {
      const builder = new FilterBuilder({where: {name: 'John'}});
      builder.impose({where: {name: 'Jane', age: 30}});
      expect(builder.build()).to.eql({
        where: {and: [{name: 'John'}, {name: 'Jane', age: 30}]},
      });
    });

    it('throws error when imposing filter with non-where fields', () => {
      const builder = new FilterBuilder({
        where: {name: 'John'},
        limit: 10,
      });
      expect(() => {
        builder.impose({where: {age: 30}, limit: 20});
      }).to.throw(/merging strategy for selection, pagination, and sorting/);
    });

    it('throws error when imposing filter with fields', () => {
      const builder = new FilterBuilder({where: {name: 'John'}});
      expect(() => {
        builder.impose({where: {age: 30}, fields: {name: true}});
      }).to.throw(/merging strategy for selection, pagination, and sorting/);
    });

    it('throws error when imposing filter with order', () => {
      const builder = new FilterBuilder({where: {name: 'John'}});
      expect(() => {
        builder.impose({where: {age: 30}, order: ['name ASC']});
      }).to.throw(/merging strategy for selection, pagination, and sorting/);
    });

    it('throws error when imposing filter with include', () => {
      const builder = new FilterBuilder({where: {name: 'John'}});
      expect(() => {
        builder.impose({where: {age: 30}, include: [{relation: 'orders'}]});
      }).to.throw(/merging strategy for selection, pagination, and sorting/);
    });
  });

  describe('build', () => {
    it('returns the constructed filter object', () => {
      const builder = new FilterBuilder();
      builder.where({name: 'John'}).limit(10).offset(5);
      const filter = builder.build();
      expect(filter).to.eql({
        where: {name: 'John'},
        limit: 10,
        offset: 5,
      });
    });

    it('returns empty object when no clauses added', () => {
      const builder = new FilterBuilder();
      expect(builder.build()).to.eql({});
    });
  });

  describe('complex scenarios', () => {
    it('builds complete filter with all clauses', () => {
      const builder = new FilterBuilder();
      builder
        .fields('name', 'email', 'age')
        .where({status: 'active', age: {gt: 18}})
        .order('name ASC', 'age DESC')
        .limit(20)
        .offset(10)
        .include('orders', {relation: 'profile', scope: {limit: 1}});

      expect(builder.build()).to.eql({
        fields: {name: true, email: true, age: true},
        where: {status: 'active', age: {gt: 18}},
        order: ['name ASC', 'age DESC'],
        limit: 20,
        offset: 10,
        include: [
          {relation: 'orders'},
          {relation: 'profile', scope: {limit: 1}},
        ],
      });
    });

    it('builds filter with nested includes', () => {
      const builder = new FilterBuilder();
      builder.include({
        relation: 'orders',
        scope: {
          where: {status: 'completed'},
          include: [{relation: 'items'}],
        },
      });

      expect(builder.build()).to.eql({
        include: [
          {
            relation: 'orders',
            scope: {
              where: {status: 'completed'},
              include: [{relation: 'items'}],
            },
          },
        ],
      });
    });
  });
});

describe('isFilter', () => {
  it('returns true for valid filter with where', () => {
    expect(isFilter({where: {name: 'John'}})).to.be.true();
  });

  it('returns true for valid filter with fields', () => {
    expect(isFilter({fields: {name: true}})).to.be.true();
  });

  it('returns true for valid filter with order', () => {
    expect(isFilter({order: ['name ASC']})).to.be.true();
  });

  it('returns true for valid filter with limit', () => {
    expect(isFilter({limit: 10})).to.be.true();
  });

  it('returns true for valid filter with skip', () => {
    expect(isFilter({skip: 5})).to.be.true();
  });

  it('returns true for valid filter with offset', () => {
    expect(isFilter({offset: 5})).to.be.true();
  });

  it('returns true for valid filter with include', () => {
    expect(isFilter({include: [{relation: 'orders'}]})).to.be.true();
  });

  it('returns true for empty object', () => {
    expect(isFilter({})).to.be.true();
  });

  it('returns true for filter with multiple valid fields', () => {
    expect(
      isFilter({
        where: {name: 'John'},
        limit: 10,
        order: ['name ASC'],
      }),
    ).to.be.true();
  });

  it('returns false for object with invalid fields', () => {
    expect(isFilter({where: {}, invalidField: 'value'})).to.be.false();
  });

  it('returns false for array', () => {
    expect(isFilter([{where: {}}])).to.be.false();
  });
});

describe('filterTemplate', () => {
  it('builds filter from template with simple values', () => {
    const template = filterTemplate`{"limit": ${'limit'}}`;
    const result = template({limit: 10});
    expect(result).to.eql({limit: 10});
  });

  it('builds filter with where clause', () => {
    const template = filterTemplate`{"where": {"name": ${'name'}}}`;
    const result = template({name: 'John'});
    expect(result).to.eql({where: {name: 'John'}});
  });

  it('builds filter with multiple placeholders', () => {
    const template = filterTemplate`{
      "limit": ${'limit'},
      "where": {${'key'}: ${'value'}}
    }`;
    const result = template({limit: 10, key: 'name', value: 'John'});
    expect(result).to.eql({limit: 10, where: {name: 'John'}});
  });

  it('handles nested property paths', () => {
    const template = filterTemplate`{
      "limit": ${'pagination.limit'},
      "offset": ${'pagination.offset'}
    }`;
    const result = template({
      pagination: {limit: 10, offset: 5},
    });
    expect(result).to.eql({limit: 10, offset: 5});
  });

  it('handles deep nested property paths', () => {
    const template = filterTemplate`{
      "where": {"name": ${'user.profile.name'}}
    }`;
    const result = template({
      user: {profile: {name: 'John'}},
    });
    expect(result).to.eql({where: {name: 'John'}});
  });

  it('returns null for missing nested properties', () => {
    const template = filterTemplate`{
      "where": {"name": ${'user.profile.name'}}
    }`;
    const result = template({user: {}});
    expect(result).to.eql({where: {name: null}});
  });

  it('handles number literals', () => {
    const limit = 10;
    const template = filterTemplate`{"limit": ${limit}}`;
    const result = template({});
    expect(result).to.eql({limit: 10});
  });

  it('handles boolean literals', () => {
    const active = true;
    const template = filterTemplate`{"where": {"active": ${active}}}`;
    const result = template({});
    expect(result).to.eql({where: {active: true}});
  });

  it('handles object literals', () => {
    const where = {name: 'John', age: 30};
    const template = filterTemplate`{"where": ${where}}`;
    const result = template({});
    expect(result).to.eql({where: {name: 'John', age: 30}});
  });

  it('throws error for invalid JSON', () => {
    const template = filterTemplate`{"limit": ${'limit'}, invalid}`;
    expect(() => template({limit: 10})).to.throw(/Invalid JSON/);
  });

  it('handles complex filter template', () => {
    const template = filterTemplate`{
      "where": {
        "status": ${'status'},
        "age": {"gt": ${'minAge'}}
      },
      "limit": ${'limit'},
      "order": ["name ASC"]
    }`;
    const result = template({
      status: 'active',
      minAge: 18,
      limit: 20,
    });
    expect(result).to.eql({
      where: {status: 'active', age: {gt: 18}},
      limit: 20,
      order: ['name ASC'],
    });
  });

  it('handles empty context', () => {
    const template = filterTemplate`{"limit": 10}`;
    const result = template({});
    expect(result).to.eql({limit: 10});
  });
});

// Made with Bob
