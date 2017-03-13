// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as types from '../../../lib/types/index';

describe('types', () => {

  describe('string', () => {
    const stringType  = new types.StringType();
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
      let date = new Date();
      expect(stringType.coerce(date)).to.equal(date.toJSON());
    });

    it('serializes values', () => {
      expect(stringType.serialize('str')).to.eql('str');
      expect(stringType.serialize(null)).null();
      expect(stringType.serialize(undefined)).undefined();
    });

  });

  describe('boolean', () => {
    const booleanType  = new types.BooleanType();
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
      expect(booleanType.coerce('false')).to.equal(true); // string false is true
      expect(booleanType.coerce(0)).to.equal(false);
      expect(booleanType.coerce(1)).to.equal(true);
      let date = new Date();
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
    const numberType  = new types.NumberType();
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
      let date = new Date();
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
    const dateType  = new types.DateType();
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
      let d = new Date();
      let v = dateType.defaultValue();
      expect(v.getTime()).to.closeTo(d.getTime(), 1);
    });

    it('coerces values', () => {
      expect(() => dateType.coerce('str')).to.throw(/Invalid date/);
      expect(dateType.coerce('1')).to.eql(
        new Date('2001-01-01T08:00:00.000Z'));
      expect(dateType.coerce('1.1')).to.eql(
        new Date('2001-01-01T08:00:00.000Z'));
      expect(dateType.coerce(null)).to.equal(null);
      expect(dateType.coerce(undefined)).to.equal(undefined);
      expect(dateType.coerce(true)).to.eql(new Date(1));
      expect(dateType.coerce(false)).to.eql(new Date(0));
      expect(() => dateType.coerce({x: 1})).to.throw(/Invalid date/);
      expect(dateType.coerce([1, '2'])).to.eql(
        new Date('2001-01-02T08:00:00.000Z'));
      expect(dateType.coerce(1)).to.eql(new Date('1970-01-01T00:00:00.001Z'));
      expect(dateType.coerce(1.1)).to.eql(
        new Date('1970-01-01T00:00:00.001Z'));
      let date = new Date();
      expect(dateType.coerce(date)).to.equal(date);
    });

    it('serializes values', () => {
      let date = new Date();
      expect(dateType.serialize(date)).to.eql(date.toJSON());
      expect(dateType.serialize(null)).null();
      expect(dateType.serialize(undefined)).undefined();
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
      let date = new Date();
      expect(unionType.coerce(date)).to.equal(date.getTime());
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

});