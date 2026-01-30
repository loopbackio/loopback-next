// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/filter
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {AnyObject} from '../../types';

describe('AnyObject - Unit Tests', () => {
  it('allows objects with string keys and any values', () => {
    const obj: AnyObject = {
      name: 'John',
      age: 30,
      active: true,
      metadata: {nested: 'value'},
      tags: ['tag1', 'tag2'],
    };
    expect(obj).to.be.an.Object();
    expect(obj.name).to.equal('John');
    expect(obj.age).to.equal(30);
    expect(obj.active).to.be.true();
  });

  it('allows empty objects', () => {
    const obj: AnyObject = {};
    expect(obj).to.eql({});
  });

  it('allows objects with numeric values', () => {
    const obj: AnyObject = {
      count: 42,
      price: 19.99,
      negative: -5,
    };
    expect(obj.count).to.equal(42);
    expect(obj.price).to.equal(19.99);
    expect(obj.negative).to.equal(-5);
  });

  it('allows objects with string values', () => {
    const obj: AnyObject = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };
    expect(obj.firstName).to.equal('John');
    expect(obj.lastName).to.equal('Doe');
  });

  it('allows objects with boolean values', () => {
    const obj: AnyObject = {
      active: true,
      verified: false,
      deleted: false,
    };
    expect(obj.active).to.be.true();
    expect(obj.verified).to.be.false();
  });

  it('allows objects with null values', () => {
    const obj: AnyObject = {
      middleName: null,
      deletedAt: null,
    };
    expect(obj.middleName).to.be.null();
    expect(obj.deletedAt).to.be.null();
  });

  it('allows objects with undefined values', () => {
    const obj: AnyObject = {
      optionalField: undefined,
    };
    expect(obj.optionalField).to.be.undefined();
  });

  it('allows objects with array values', () => {
    const obj: AnyObject = {
      tags: ['tag1', 'tag2', 'tag3'],
      numbers: [1, 2, 3],
      mixed: ['string', 42, true, null],
    };
    expect(obj.tags).to.be.an.Array();
    expect(obj.tags).to.have.length(3);
    expect(obj.numbers).to.eql([1, 2, 3]);
  });

  it('allows objects with nested objects', () => {
    const obj: AnyObject = {
      user: {
        name: 'John',
        profile: {
          age: 30,
          address: {
            city: 'New York',
            country: 'USA',
          },
        },
      },
    };
    expect(obj.user).to.be.an.Object();
    expect(obj.user.name).to.equal('John');
    expect(obj.user.profile.address.city).to.equal('New York');
  });

  it('allows objects with Date values', () => {
    const date = new Date('2020-01-01');
    const obj: AnyObject = {
      createdAt: date,
      updatedAt: new Date(),
    };
    expect(obj.createdAt).to.equal(date);
    expect(obj.updatedAt).to.be.instanceOf(Date);
  });

  it('allows objects with function values', () => {
    const obj: AnyObject = {
      callback: () => 'result',
      method: function () {
        return 'method result';
      },
    };
    expect(obj.callback).to.be.a.Function();
    expect(obj.callback()).to.equal('result');
    expect(obj.method()).to.equal('method result');
  });

  it('allows objects with Symbol keys', () => {
    const sym = Symbol('test');
    const obj: AnyObject = {
      [sym]: 'symbol value',
      regularKey: 'regular value',
    };
    // TypeScript doesn't allow symbol indexing on Record<string, any>
    // but at runtime it works
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((obj as any)[sym]).to.equal('symbol value');
    expect(obj.regularKey).to.equal('regular value');
  });

  it('allows dynamic property access', () => {
    const obj: AnyObject = {
      prop1: 'value1',
      prop2: 'value2',
    };
    const key = 'prop1';
    expect(obj[key]).to.equal('value1');
  });

  it('allows property assignment', () => {
    const obj: AnyObject = {};
    obj.newProp = 'new value';
    obj['anotherProp'] = 42;
    expect(obj.newProp).to.equal('new value');
    expect(obj.anotherProp).to.equal(42);
  });

  it('works with Object.keys', () => {
    const obj: AnyObject = {
      a: 1,
      b: 2,
      c: 3,
    };
    const keys = Object.keys(obj);
    expect(keys).to.eql(['a', 'b', 'c']);
  });

  it('works with Object.values', () => {
    const obj: AnyObject = {
      a: 1,
      b: 2,
      c: 3,
    };
    const values = Object.values(obj);
    expect(values).to.eql([1, 2, 3]);
  });

  it('works with Object.entries', () => {
    const obj: AnyObject = {
      a: 1,
      b: 2,
    };
    const entries = Object.entries(obj);
    expect(entries).to.eql([
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('works with spread operator', () => {
    const obj1: AnyObject = {a: 1, b: 2};
    const obj2: AnyObject = {c: 3, d: 4};
    const merged: AnyObject = {...obj1, ...obj2};
    expect(merged).to.eql({a: 1, b: 2, c: 3, d: 4});
  });

  it('works with Object.assign', () => {
    const obj1: AnyObject = {a: 1};
    const obj2: AnyObject = {b: 2};
    const merged = Object.assign({}, obj1, obj2);
    expect(merged).to.eql({a: 1, b: 2});
  });

  it('allows checking property existence with in operator', () => {
    const obj: AnyObject = {
      name: 'John',
      age: 30,
    };
    expect('name' in obj).to.be.true();
    expect('email' in obj).to.be.false();
  });

  it('allows deleting properties', () => {
    const obj: AnyObject = {
      name: 'John',
      age: 30,
    };
    delete obj.age;
    expect(obj).to.eql({name: 'John'});
    expect('age' in obj).to.be.false();
  });
});

// Made with Bob
