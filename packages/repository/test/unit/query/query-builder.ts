// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  FilterBuilder,
  Filter,
  WhereBuilder,
  Where,
  filterTemplate,
} from '../../../';

describe('WhereBuilder', () => {
  it('builds where object', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .eq('a', 1)
      .gt('b', 2)
      .lt('c', 2)
      .eq('x', 'x')
      .build();
    expect(where).to.eql({a: 1, b: {gt: 2}, c: {lt: 2}, x: 'x'});
  });

  it('builds where object with multiple clauses using the same key', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .gt('a', 2)
      .lt('a', 4)
      .build();
    expect(where).to.eql({and: [{a: {gt: 2}}, {a: {lt: 4}}]});
  });

  it('builds where object with inq', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .inq('x', [1, 2, 3])
      .inq('y', ['a', 'b'])
      .build();
    expect(where).to.eql({x: {inq: [1, 2, 3]}, y: {inq: ['a', 'b']}});
  });

  it('builds where object with between', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .between('x', 1, 2)
      .between('y', 'a', 'b')
      .build();
    expect(where).to.eql({x: {between: [1, 2]}, y: {between: ['a', 'b']}});
  });

  it('builds where object with or', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .eq('a', 1)
      .gt('b', 2)
      .lt('c', 2)
      .or({x: 'x'}, {y: {gt: 1}})
      .build();
    expect(where).to.eql({
      a: 1,
      b: {gt: 2},
      c: {lt: 2},
      or: [{x: 'x'}, {y: {gt: 1}}],
    });
  });

  it('builds where object with and', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .eq('a', 1)
      .gt('b', 2)
      .lt('c', 2)
      .and({x: 'x'}, {y: {gt: 1}})
      .build();
    expect(where).to.eql({
      a: 1,
      b: {gt: 2},
      c: {lt: 2},
      and: [{x: 'x'}, {y: {gt: 1}}],
    });
  });

  it('builds where object with existing and', () => {
    const whereBuilder = new WhereBuilder();
    const where = whereBuilder
      .eq('a', 1)
      .and({x: 'x'}, {y: {gt: 1}})
      .and({b: 'b'}, {c: {lt: 1}})
      .build();
    expect(where).to.eql({
      and: [
        {
          a: 1,
          and: [{x: 'x'}, {y: {gt: 1}}],
        },
        {
          and: [{b: 'b'}, {c: {lt: 1}}],
        },
      ],
    });
  });

  it('builds where object from an existing one', () => {
    const whereBuilder = new WhereBuilder({y: 'y'});
    const where = whereBuilder
      .eq('a', 1)
      .gt('b', 2)
      .lt('c', 2)
      .eq('x', 'x')
      .build();
    expect(where).to.eql({y: 'y', a: 1, b: {gt: 2}, c: {lt: 2}, x: 'x'});
  });
});

describe('FilterBuilder', () => {
  it('builds a filter object with field names', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.fields('a', 'b', 'c');
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      fields: {
        a: true,
        b: true,
        c: true,
      },
    });
  });

  it('builds a filter object with field object', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.fields({a: true, b: false});
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      fields: {
        a: true,
        b: false,
      },
    });
  });

  it('builds a filter object with mixed field names and objects', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.fields({a: true, b: false}, 'c', ['d', 'e']);
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      fields: {
        a: true,
        b: false,
        c: true,
        d: true,
        e: true,
      },
    });
  });

  it('builds a filter object with limit/offset', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.limit(10).offset(5);
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      limit: 10,
      offset: 5,
    });
  });

  it('builds a filter object with limit/skip', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.limit(10).skip(5);
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      limit: 10,
      offset: 5,
    });
  });

  it('validates limit', () => {
    expect(() => {
      const filterBuilder = new FilterBuilder();
      filterBuilder.limit(-10).offset(5);
    }).to.throw(/Limit \-10 must a positive number/);
  });

  it('builds a filter object with order names', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.order('a', 'b', 'c');
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      order: ['a', 'b', 'c'],
    });
  });

  it('builds a filter object with order object', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.order({a: 1, b: -1});
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      order: ['a ASC', 'b DESC'],
    });
  });

  it('builds a filter object with mixed field names and objects', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.order({a: 'ASC', b: 'DESC'}, 'c DESC', ['d', 'e']);
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      order: ['a ASC', 'b DESC', 'c DESC', 'd', 'e'],
    });
  });

  it('validates order', () => {
    expect(() => {
      const filterBuilder = new FilterBuilder();
      filterBuilder.order('a x');
    }).to.throw(/Invalid order/);
  });

  it('builds a filter object with where', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.where({x: 1, and: [{a: {gt: 2}}, {b: 2}]});
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      where: {x: 1, and: [{a: {gt: 2}}, {b: 2}]},
    });
  });

  it('builds a filter object with included relation names', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.include('orders', 'friends');
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      include: [{relation: 'orders'}, {relation: 'friends'}],
    });
  });

  it('builds a filter object with included an array of relation names', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.include(['orders', 'friends']);
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      include: [{relation: 'orders'}, {relation: 'friends'}],
    });
  });

  it('builds a filter object with inclusion objects', () => {
    const filterBuilder = new FilterBuilder();
    filterBuilder.include(
      {relation: 'orders'},
      {relation: 'friends', scope: {where: {name: 'ray'}}},
    );
    const filter = filterBuilder.build();
    expect(filter).to.eql({
      include: [
        {relation: 'orders'},
        {relation: 'friends', scope: {where: {name: 'ray'}}},
      ],
    });
  });
});

describe('FilterTemplate', () => {
  it('builds filter object', () => {
    const filter = filterTemplate`{"limit": ${'limit'},
    "where": {${'key'}: ${'value'}}}`;
    const result = filter({limit: 10, key: 'name', value: 'John'});
    expect(result).to.eql({
      limit: 10,
      where: {
        name: 'John',
      },
    });
  });
});
