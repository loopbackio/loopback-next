// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as types from '../../../';

describe('types', () => {
  describe('string', () => {
    const stringType = new types.StringType();
    it('checks isInstance', () => {
      expect(stringType.isInstance('str')).to.be.true();
      expect(stringType.isInstance(null)).to.be.true();
      expect(stringType.isInstance(undefined)).to.be.true();
      expect(stringType.isInstance(true)).to.be.false();
      expect(stringType.isInstance({x: 1})).to.be.false();
      expect(stringType.isInstance([1, 2])).to.be.false();
      expect(stringType.isInstance(1)).to.be.false();
      expect(stringType.isInstance(new Date())).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(stringType.isCoercible('str')).to.be.true();
      expect(stringType.isCoercible(null)).to.be.true();
      expect(stringType.isCoercible(undefined)).to.be.true();
      expect(stringType.isCoercible(true)).to.be.true();
      expect(stringType.isCoercible({x: 1})).to.be.true();
      expect(stringType.isCoercible(1)).to.be.true();
      expect(stringType.isCoercible(new Date())).to.be.true();
    });

    it('creates defaultValue', () => {
      expect(stringType.defaultValue()).to.be.equal('');
    });

    it('coerces values', () => {
      expect(stringType.coerce('str')).to.equal('str');
      expect(stringType.coerce(null)).to.equal(null);
      expect(stringType.coerce(undefined)).to.equal(undefined);
      expect(stringType.coerce(true)).to.equal('true');
      expect(stringType.coerce({x: 1})).to.equal('{"x":1}');
      expect(stringType.coerce([1, '2'])).to.equal('[1,"2"]');
      expect(stringType.coerce(1)).to.equal('1');
      const date = new Date();
      expect(stringType.coerce(date)).to.equal(date.toJSON());
    });

    it('serializes values', () => {
      expect(stringType.serialize('str')).to.eql('str');
      expect(stringType.serialize(null)).null();
      expect(stringType.serialize(undefined)).undefined();
    });
  });

  describe('boolean', () => {
    const booleanType = new types.BooleanType();
    it('checks isInstance', () => {
      expect(booleanType.isInstance('str')).to.be.false();
      expect(booleanType.isInstance(null)).to.be.true();
      expect(booleanType.isInstance(undefined)).to.be.true();
      expect(booleanType.isInstance(true)).to.be.true();
      expect(booleanType.isInstance(false)).to.be.true();
      expect(booleanType.isInstance({x: 1})).to.be.false();
      expect(booleanType.isInstance([1, 2])).to.be.false();
      expect(booleanType.isInstance(1)).to.be.false();
      expect(booleanType.isInstance(new Date())).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(booleanType.isCoercible('str')).to.be.true();
      expect(booleanType.isCoercible(null)).to.be.true();
      expect(booleanType.isCoercible(undefined)).to.be.true();
      expect(booleanType.isCoercible(true)).to.be.true();
      expect(booleanType.isCoercible({x: 1})).to.be.true();
      expect(booleanType.isCoercible(1)).to.be.true();
      expect(booleanType.isCoercible(new Date())).to.be.true();
    });

    it('creates defaultValue', () => {
      expect(booleanType.defaultValue()).to.be.equal(false);
    });

    it('coerces values', () => {
      expect(booleanType.coerce('str')).to.equal(true);
      expect(booleanType.coerce(null)).to.equal(null);
      expect(booleanType.coerce(undefined)).to.equal(undefined);
      expect(booleanType.coerce(true)).to.equal(true);
      expect(booleanType.coerce(false)).to.equal(false);
      expect(booleanType.coerce({x: 1})).to.equal(true);
      expect(booleanType.coerce([1, '2'])).to.equal(true);
      expect(booleanType.coerce('')).to.equal(false);
      expect(booleanType.coerce('true')).to.equal(true);
      // string 'false' is boolean true
      expect(booleanType.coerce('false')).to.equal(true);
      expect(booleanType.coerce(0)).to.equal(false);
      expect(booleanType.coerce(1)).to.equal(true);
      const date = new Date();
      expect(booleanType.coerce(date)).to.equal(true);
    });

    it('serializes values', () => {
      expect(booleanType.serialize(true)).to.eql(true);
      expect(booleanType.serialize(false)).to.eql(false);
      expect(booleanType.serialize(null)).null();
      expect(booleanType.serialize(undefined)).undefined();
    });
  });

  describe('number', () => {
    const numberType = new types.NumberType();
    it('checks isInstance', () => {
      expect(numberType.isInstance('str')).to.be.false();
      expect(numberType.isInstance(null)).to.be.true();
      expect(numberType.isInstance(undefined)).to.be.true();
      expect(numberType.isInstance(NaN)).to.be.false();
      expect(numberType.isInstance(true)).to.be.false();
      expect(numberType.isInstance({x: 1})).to.be.false();
      expect(numberType.isInstance([1, 2])).to.be.false();
      expect(numberType.isInstance(1)).to.be.true();
      expect(numberType.isInstance(1.1)).to.be.true();
      expect(numberType.isInstance(new Date())).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(numberType.isCoercible('str')).to.be.false();
      expect(numberType.isCoercible('1')).to.be.true();
      expect(numberType.isCoercible('1.1')).to.be.true();
      expect(numberType.isCoercible(null)).to.be.true();
      expect(numberType.isCoercible(undefined)).to.be.true();
      expect(numberType.isCoercible(true)).to.be.true();
      expect(numberType.isCoercible(false)).to.be.true();
      expect(numberType.isCoercible({x: 1})).to.be.false();
      expect(numberType.isCoercible(1)).to.be.true();
      expect(numberType.isCoercible(1.1)).to.be.true();
      // Date can be converted to number
      expect(numberType.isCoercible(new Date())).to.be.true();
    });

    it('creates defaultValue', () => {
      expect(numberType.defaultValue()).to.be.equal(0);
    });

    it('coerces values', () => {
      expect(() => numberType.coerce('str')).to.throw(/Invalid number/);
      expect(numberType.coerce('1')).to.equal(1);
      expect(numberType.coerce('1.1')).to.equal(1.1);
      expect(numberType.coerce(null)).to.equal(null);
      expect(numberType.coerce(undefined)).to.equal(undefined);
      expect(numberType.coerce(true)).to.equal(1);
      expect(numberType.coerce(false)).to.equal(0);
      expect(() => numberType.coerce({x: 1})).to.throw(/Invalid number/);
      expect(() => numberType.coerce([1, '2'])).to.throw(/Invalid number/);
      expect(numberType.coerce(1)).to.equal(1);
      expect(numberType.coerce(1.1)).to.equal(1.1);
      const date = new Date();
      expect(numberType.coerce(date)).to.equal(date.getTime());
    });

    it('serializes values', () => {
      expect(numberType.serialize(1)).to.eql(1);
      expect(numberType.serialize(1.1)).to.eql(1.1);
      expect(numberType.serialize(null)).null();
      expect(numberType.serialize(undefined)).undefined();
    });
  });

  describe('date', () => {
    const dateType = new types.DateType();
    it('checks isInstance', () => {
      expect(dateType.isInstance('str')).to.be.false();
      expect(dateType.isInstance(null)).to.be.true();
      expect(dateType.isInstance(undefined)).to.be.true();
      expect(dateType.isInstance(NaN)).to.be.false();
      expect(dateType.isInstance(true)).to.be.false();
      expect(dateType.isInstance({x: 1})).to.be.false();
      expect(dateType.isInstance([1, 2])).to.be.false();
      expect(dateType.isInstance(1)).to.be.false();
      expect(dateType.isInstance(1.1)).to.be.false();
      expect(dateType.isInstance(new Date())).to.be.true();
    });

    it('checks isCoercible', () => {
      expect(dateType.isCoercible('str')).to.be.false();
      expect(dateType.isCoercible('1')).to.be.true();
      expect(dateType.isCoercible('1.1')).to.be.true();
      expect(dateType.isCoercible(null)).to.be.true();
      expect(dateType.isCoercible(undefined)).to.be.true();
      expect(dateType.isCoercible(true)).to.be.true();
      expect(dateType.isCoercible(false)).to.be.true();
      expect(dateType.isCoercible({x: 1})).to.be.false();
      expect(dateType.isCoercible(1)).to.be.true();
      expect(dateType.isCoercible(1.1)).to.be.true();
      // Date can be converted to number
      expect(dateType.isCoercible(new Date())).to.be.true();
    });

    it('creates defaultValue', () => {
      const d = new Date();
      const v = dateType.defaultValue();
      expect(v.getTime()).to.aboveOrEqual(d.getTime());
      expect(v.getTime()).to.approximately(d.getTime(), 50);
    });

    it('coerces values', () => {
      expect(() => dateType.coerce('str')).to.throw(/Invalid date/);
      // '1' will be parsed as local 2001-01-01
      expect(dateType.coerce('1')).to.eql(new Date('01/01/2001'));
      // '1.1' will be parsed as local 2001-01-01
      expect(dateType.coerce('1.1')).to.eql(new Date('01/01/2001'));
      expect(dateType.coerce(null)).to.equal(null);
      expect(dateType.coerce(undefined)).to.equal(undefined);
      expect(dateType.coerce(true)).to.eql(new Date(1));
      expect(dateType.coerce(false)).to.eql(new Date(0));
      expect(() => dateType.coerce({x: 1})).to.throw(/Invalid date/);
      expect(dateType.coerce([1, '2'])).to.eql(new Date('01/02/2001'));
      expect(dateType.coerce(1)).to.eql(new Date('1970-01-01T00:00:00.001Z'));
      expect(dateType.coerce(1.1)).to.eql(new Date('1970-01-01T00:00:00.001Z'));
      const date = new Date();
      expect(dateType.coerce(date)).to.equal(date);
    });

    it('serializes values', () => {
      const date = new Date();
      expect(dateType.serialize(date)).to.eql(date.toJSON());
      expect(dateType.serialize(null)).null();
      expect(dateType.serialize(undefined)).undefined();
    });
  });

  describe('buffer', () => {
    const bufferType = new types.BufferType();
    it('checks isInstance', () => {
      expect(bufferType.isInstance(Buffer.from([1]))).to.be.true();
      expect(bufferType.isInstance(Buffer.from('123'))).to.be.true();
      expect(bufferType.isInstance('str')).to.be.false();
      expect(bufferType.isInstance(null)).to.be.true();
      expect(bufferType.isInstance(undefined)).to.be.true();
      expect(bufferType.isInstance(true)).to.be.false();
      expect(bufferType.isInstance({x: 1})).to.be.false();
      expect(bufferType.isInstance([1, 2])).to.be.false();
      expect(bufferType.isInstance(1)).to.be.false();
      expect(bufferType.isInstance(new Date())).to.be.false();
      expect(bufferType.isInstance([1])).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(bufferType.isCoercible('str')).to.be.true();
      expect(bufferType.isCoercible(null)).to.be.true();
      expect(bufferType.isCoercible(undefined)).to.be.true();
      expect(bufferType.isCoercible(Buffer.from('12'))).to.be.true();
      expect(bufferType.isCoercible([1, 2])).to.be.true();
      expect(bufferType.isCoercible({x: 1})).to.be.false();
      expect(bufferType.isCoercible(1)).to.be.false();
      expect(bufferType.isCoercible(new Date())).to.be.false();
    });

    it('creates defaultValue', () => {
      expect(bufferType.defaultValue().equals(Buffer.from([]))).to.be.true();
    });

    it('coerces values', () => {
      expect(bufferType.coerce('str').equals(Buffer.from('str'))).to.be.true();
      expect(bufferType.coerce([1]).equals(Buffer.from([1]))).to.be.true();
      expect(bufferType.coerce(null)).to.equal(null);
      expect(bufferType.coerce(undefined)).to.equal(undefined);
      const buf = Buffer.from('12');
      expect(bufferType.coerce(buf)).exactly(buf);
      expect(() => bufferType.coerce(1)).to.throw(/Invalid buffer/);
      expect(() => bufferType.coerce(new Date())).to.throw(/Invalid buffer/);
      expect(() => bufferType.coerce(true)).to.throw(/Invalid buffer/);
      expect(() => bufferType.coerce(false)).to.throw(/Invalid buffer/);
    });

    it('serializes values', () => {
      expect(
        bufferType.serialize(Buffer.from('str'), {encoding: 'utf-8'}),
      ).to.eql('str');
      expect(bufferType.serialize(Buffer.from('str'))).to.eql('c3Ry');
      expect(bufferType.serialize(null)).null();
      expect(bufferType.serialize(undefined)).undefined();
    });
  });

  describe('any', () => {
    const anyType = new types.AnyType();
    it('checks isInstance', () => {
      expect(anyType.isInstance('str')).to.be.true();
      expect(anyType.isInstance(null)).to.be.true();
      expect(anyType.isInstance(undefined)).to.be.true();
      expect(anyType.isInstance(true)).to.be.true();
      expect(anyType.isInstance({x: 1})).to.be.true();
      expect(anyType.isInstance([1, 2])).to.be.true();
      expect(anyType.isInstance(1)).to.be.true();
      expect(anyType.isInstance(new Date())).to.be.true();
      expect(anyType.isInstance(Buffer.from('123'))).to.be.true();
    });

    it('checks isCoercible', () => {
      expect(anyType.isCoercible('str')).to.be.true();
      expect(anyType.isCoercible(null)).to.be.true();
      expect(anyType.isCoercible(undefined)).to.be.true();
      expect(anyType.isCoercible(true)).to.be.true();
      expect(anyType.isCoercible({x: 1})).to.be.true();
      expect(anyType.isCoercible(1)).to.be.true();
      expect(anyType.isCoercible([1, '2'])).to.be.true();
      expect(anyType.isCoercible(new Date())).to.be.true();
      expect(anyType.isCoercible(Buffer.from('123'))).to.be.true();
    });

    it('creates defaultValue', () => {
      expect(anyType.defaultValue()).to.equal(undefined);
    });

    it('coerces values', () => {
      expect(anyType.coerce('str')).to.equal('str');
      expect(anyType.coerce(null)).to.equal(null);
      expect(anyType.coerce(undefined)).to.equal(undefined);
      expect(anyType.coerce(true)).to.equal(true);
      const obj = {x: 1};
      expect(anyType.coerce(obj)).to.equal(obj);
      const arr = [1, '2'];
      expect(anyType.coerce(arr)).to.equal(arr);
      expect(anyType.coerce(1)).to.equal(1);
      const date = new Date();
      expect(anyType.coerce(date)).to.equal(date);
      const buf = Buffer.from('12');
      expect(anyType.coerce(buf)).to.equal(buf);
    });

    it('serializes values', () => {
      expect(anyType.serialize('str')).to.eql('str');
      expect(anyType.serialize(1)).to.eql(1);
      expect(anyType.serialize([1, '2'])).to.eql([1, '2']);
      expect(anyType.serialize(null)).null();
      expect(anyType.serialize(undefined)).undefined();
      const date = new Date();
      expect(anyType.serialize(date)).to.eql(date.toJSON());
      const obj = {x: 1};
      expect(anyType.serialize(obj)).to.eql(obj);
      const json = {
        x: 1,
        y: 2,
        toJSON() {
          return {a: json.x + json.y};
        },
      };
      expect(anyType.serialize(json)).to.eql({a: 3});
    });
  });

  describe('null', () => {
    const nullType = new types.NullType();
    it('checks isInstance', () => {
      expect(nullType.isInstance('str')).to.be.false();
      expect(nullType.isInstance(null)).to.be.true();
      expect(nullType.isInstance(undefined)).to.be.false();
      expect(nullType.isInstance(true)).to.be.false();
      expect(nullType.isInstance(false)).to.be.false();
      expect(nullType.isInstance({x: 1})).to.be.false();
      expect(nullType.isInstance([1, 2])).to.be.false();
      expect(nullType.isInstance(1)).to.be.false();
      expect(nullType.isInstance(new Date())).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(nullType.isCoercible('str')).to.be.false();
      expect(nullType.isCoercible(null)).to.be.true();
      expect(nullType.isCoercible(undefined)).to.be.true();
      expect(nullType.isCoercible(true)).to.be.false();
      expect(nullType.isCoercible({x: 1})).to.be.false();
      expect(nullType.isCoercible(1)).to.be.false();
      expect(nullType.isCoercible(new Date())).to.be.false();
    });

    it('creates defaultValue', () => {
      expect(nullType.defaultValue()).to.be.null();
    });

    it('coerces values', () => {
      expect(nullType.coerce(null)).to.null();
      expect(nullType.coerce(undefined)).to.null();
    });

    it('serializes values', () => {
      expect(nullType.serialize(null)).null();
      expect(nullType.serialize(undefined)).null();
    });
  });

  describe('array', () => {
    const stringType = new types.StringType();
    const arrayType = new types.ArrayType(stringType);

    it('checks isInstance', () => {
      expect(arrayType.isInstance('str')).to.be.false();
      expect(arrayType.isInstance(null)).to.be.true();
      expect(arrayType.isInstance(undefined)).to.be.true();
      expect(arrayType.isInstance(NaN)).to.be.false();
      expect(arrayType.isInstance(true)).to.be.false();
      expect(arrayType.isInstance({x: 1})).to.be.false();
      expect(arrayType.isInstance([1, 2])).to.be.false();
      expect(arrayType.isInstance([1, '2'])).to.be.false();
      expect(arrayType.isInstance(['1'])).to.be.true();
      expect(arrayType.isInstance(['1', 'a'])).to.be.true();
      expect(arrayType.isInstance(['1', 'a', null])).to.be.true();
      expect(arrayType.isInstance(['1', 'a', undefined])).to.be.true();
      expect(arrayType.isInstance([])).to.be.true();
      expect(arrayType.isInstance(1)).to.be.false();
      expect(arrayType.isInstance(1.1)).to.be.false();
      expect(arrayType.isInstance(new Date())).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(arrayType.isCoercible('str')).to.be.false();
      expect(arrayType.isCoercible('1')).to.be.false();
      expect(arrayType.isCoercible('1.1')).to.be.false();
      expect(arrayType.isCoercible(null)).to.be.true();
      expect(arrayType.isCoercible(undefined)).to.be.true();
      expect(arrayType.isCoercible(true)).to.be.false();
      expect(arrayType.isCoercible(false)).to.be.false();
      expect(arrayType.isCoercible({x: 1})).to.be.false();
      expect(arrayType.isCoercible(1)).to.be.false();
      expect(arrayType.isCoercible(1.1)).to.be.false();
      expect(arrayType.isCoercible(new Date())).to.be.false();
      expect(arrayType.isCoercible([])).to.be.true();
      expect(arrayType.isCoercible(['1'])).to.be.true();
      expect(arrayType.isCoercible(['1', 2])).to.be.true();
    });

    it('creates defaultValue', () => {
      expect(arrayType.defaultValue()).to.be.eql([]);
    });

    it('coerces values', () => {
      expect(() => arrayType.coerce('str')).to.throw(/Invalid array/);
      expect(() => arrayType.coerce('1')).to.throw(/Invalid array/);
      expect(() => arrayType.coerce('1.1')).to.throw(/Invalid array/);
      expect(arrayType.coerce(null)).to.equal(null);
      expect(arrayType.coerce(undefined)).to.equal(undefined);

      expect(() => arrayType.coerce(true)).to.throw(/Invalid array/);
      expect(() => arrayType.coerce(false)).to.throw(/Invalid array/);
      expect(() => arrayType.coerce({x: 1})).to.throw(/Invalid array/);
      expect(() => arrayType.coerce(1)).to.throw(/Invalid array/);

      const date = new Date();
      expect(() => arrayType.coerce(date)).to.throw(/Invalid array/);

      expect(arrayType.coerce([1, '2'])).to.eql(['1', '2']);
      expect(arrayType.coerce(['2'])).to.eql(['2']);
      expect(arrayType.coerce([null, undefined, '2'])).to.eql([
        null,
        undefined,
        '2',
      ]);
      expect(arrayType.coerce([true, '2'])).to.eql(['true', '2']);
      expect(arrayType.coerce([false, '2'])).to.eql(['false', '2']);
      expect(arrayType.coerce([date])).to.eql([date.toJSON()]);
    });

    it('serializes values', () => {
      expect(arrayType.serialize(['a'])).to.eql(['a']);
      expect(arrayType.serialize(null)).null();
      expect(arrayType.serialize(undefined)).undefined();
    });
  });

  describe('union', () => {
    const numberType = new types.NumberType();
    const booleanType = new types.BooleanType();
    const unionType = new types.UnionType([numberType, booleanType]);

    it('checks isInstance', () => {
      expect(unionType.isInstance('str')).to.be.false();
      expect(unionType.isInstance(null)).to.be.true();
      expect(unionType.isInstance(undefined)).to.be.true();
      expect(unionType.isInstance(NaN)).to.be.false();
      expect(unionType.isInstance(true)).to.be.true();
      expect(unionType.isInstance({x: 1})).to.be.false();
      expect(unionType.isInstance([1, 2])).to.be.false();
      expect(unionType.isInstance(1)).to.be.true();
      expect(unionType.isInstance(1.1)).to.be.true();
      expect(unionType.isInstance(new Date())).to.be.false();
    });

    it('checks isCoercible', () => {
      expect(unionType.isCoercible('str')).to.be.true();
      expect(unionType.isCoercible('1')).to.be.true();
      expect(unionType.isCoercible('1.1')).to.be.true();
      expect(unionType.isCoercible(null)).to.be.true();
      expect(unionType.isCoercible(undefined)).to.be.true();
      expect(unionType.isCoercible(true)).to.be.true();
      expect(unionType.isCoercible(false)).to.be.true();
      expect(unionType.isCoercible({x: 1})).to.be.true();
      expect(unionType.isCoercible(1)).to.be.true();
      expect(unionType.isCoercible(1.1)).to.be.true();
      // Date can be converted to number
      expect(unionType.isCoercible(new Date())).to.be.true();
    });

    it('creates defaultValue', () => {
      expect(unionType.defaultValue()).to.be.equal(0);
    });

    it('coerces values', () => {
      expect(unionType.coerce('str')).to.equal(true);
      expect(unionType.coerce('1')).to.equal(1);
      expect(unionType.coerce('1.1')).to.equal(1.1);
      expect(unionType.coerce(null)).to.equal(null);
      expect(unionType.coerce(undefined)).to.equal(undefined);
      expect(unionType.coerce(true)).to.equal(true);
      expect(unionType.coerce(false)).to.equal(false);
      expect(unionType.coerce({x: 1})).to.equal(true);
      expect(unionType.coerce([1, '2'])).to.equal(true);
      expect(unionType.coerce(1)).to.equal(1);
      expect(unionType.coerce(1.1)).to.equal(1.1);
      const date = new Date();
      expect(unionType.coerce(date)).to.equal(date.getTime());

      // Create a new union type to test invalid value
      const dateType = new types.DateType();
      const numberOrDateType = new types.UnionType([numberType, dateType]);
      expect(() => numberOrDateType.coerce('str')).to.throw(/Invalid union/);
    });

    it('serializes values', () => {
      expect(unionType.serialize(1)).to.equal(1);
      expect(unionType.serialize(1.1)).to.equal(1.1);
      expect(unionType.serialize(true)).to.equal(true);
      expect(unionType.serialize(false)).to.equal(false);
      expect(unionType.serialize(null)).null();
      expect(unionType.serialize(undefined)).undefined();
    });
  });

  describe('model', () => {
    class Address extends types.ValueObject {
      street: string;
      city: string;
      zipCode: string;
    }

    class Customer extends types.Entity {
      id: string;
      email: string;
      address: Address;

      constructor(data?: types.AnyObject) {
        super();
        if (data != null) {
          this.id = data.id;
          this.email = data.email;
          this.address = data.address;
        }
      }
    }

    const modelType = new types.ModelType(Customer);
    it('checks isInstance', () => {
      expect(modelType.isInstance('str')).to.be.false();
      expect(modelType.isInstance(null)).to.be.true();
      expect(modelType.isInstance(undefined)).to.be.true();
      expect(modelType.isInstance(NaN)).to.be.false();
      expect(modelType.isInstance(true)).to.be.false();
      expect(modelType.isInstance({id: 'c1'})).to.be.false();
      expect(modelType.isInstance([1, 2])).to.be.false();
      expect(modelType.isInstance(1)).to.be.false();
      expect(modelType.isInstance(1.1)).to.be.false();
      expect(modelType.isInstance(new Customer())).to.be.true();
    });

    it('checks isCoercible', () => {
      expect(modelType.isCoercible('str')).to.be.false();
      expect(modelType.isCoercible('1')).to.be.false();
      expect(modelType.isCoercible('1.1')).to.be.false();
      expect(modelType.isCoercible(null)).to.be.true();
      expect(modelType.isCoercible(undefined)).to.be.true();
      expect(modelType.isCoercible(true)).to.be.false();
      expect(modelType.isCoercible(false)).to.be.false();
      expect(modelType.isCoercible({x: 1})).to.be.true();
      expect(modelType.isCoercible(1)).to.be.false();
      expect(modelType.isCoercible(1.1)).to.be.false();
      expect(modelType.isCoercible([1])).to.be.false();
      expect(modelType.isCoercible(new Customer())).to.be.true();
    });

    it('creates defaultValue', () => {
      const d = new Customer();
      const v = modelType.defaultValue();
      expect(d).to.be.eql(v);
    });

    it('coerces values', () => {
      expect(() => modelType.coerce('str')).to.throw(/Invalid model/);
      expect(modelType.coerce(null)).to.equal(null);
      expect(modelType.coerce(undefined)).to.equal(undefined);
      expect(() => modelType.coerce(true)).to.throw(/Invalid model/);
      expect(() => modelType.coerce(false)).to.throw(/Invalid model/);
      expect(() => modelType.coerce(1)).to.throw(/Invalid model/);
      expect(() => modelType.coerce(1.1)).to.throw(/Invalid model/);
      expect(() => modelType.coerce([1, '2'])).to.throw(/Invalid model/);

      const customer = modelType.coerce({id: 'c1'});
      expect(customer instanceof Customer).to.be.true();
    });

    it('serializes values', () => {
      const customer = new Customer({id: 'c1'});
      expect(modelType.serialize(customer)).to.eql(customer.toJSON());
      expect(modelType.serialize(null)).null();
      expect(modelType.serialize(undefined)).undefined();
    });
  });
});
