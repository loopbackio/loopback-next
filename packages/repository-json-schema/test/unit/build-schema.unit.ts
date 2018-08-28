// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {isComplexType, stringTypeToWrapper, metaToJsonProperty} from '../..';

describe('build-schema', () => {
  class CustomType {}

  describe('stringTypeToWrapper', () => {
    context('when given primitive types in string', () => {
      it('returns String for "string"', () => {
        expect(stringTypeToWrapper('string')).to.eql(String);
      });

      it('returns Number for "number"', () => {
        expect(stringTypeToWrapper('number')).to.eql(Number);
      });

      it('returns Boolean for "boolean"', () => {
        expect(stringTypeToWrapper('boolean')).to.eql(Boolean);
      });

      it('returns Array for "array"', () => {
        expect(stringTypeToWrapper('array')).to.eql(Array);
      });

      it('returns Buffer for "buffer"', () => {
        expect(stringTypeToWrapper('buffer')).to.eql(Buffer);
      });

      it('returns Date for "date"', () => {
        expect(stringTypeToWrapper('date')).to.eql(Date);
      });

      it('returns Object for "object"', () => {
        expect(stringTypeToWrapper('object')).to.eql(Object);
      });
    });

    it('errors out if other types are given', () => {
      expect(() => {
        stringTypeToWrapper('arbitraryType');
      }).to.throw(/Unsupported type/);
      expect(() => {
        stringTypeToWrapper('function');
      }).to.throw(/Unsupported type/);
    });
  });

  describe('isComplextype', () => {
    context('when given primitive wrappers', () => {
      it('returns false for Number', () => {
        expect(isComplexType(Number)).to.eql(false);
      });

      it('returns false for String', () => {
        expect(isComplexType(String)).to.eql(false);
      });

      it('returns false for Boolean', () => {
        expect(isComplexType(Boolean)).to.eql(false);
      });

      it('returns false for Object', () => {
        expect(isComplexType(Object)).to.eql(false);
      });

      it('returns false for Function', () => {
        expect(isComplexType(Function)).to.eql(false);
      });

      it('returns false for Array', () => {
        expect(isComplexType(Array)).to.eql(false);
      });
    });

    it('returns true if any other wrappers are passed in', () => {
      expect(isComplexType(CustomType)).to.eql(true);
    });
  });

  describe('metaToJsonSchema', () => {
    it('errors out if "itemType" is an array', () => {
      expect(() => metaToJsonProperty({type: Array, itemType: []})).to.throw(
        /itemType as an array is not supported/,
      );
    });

    it('converts types in strings', () => {
      expect(metaToJsonProperty({type: 'number'})).to.eql({
        type: 'number',
      });
    });

    it('converts primitives', () => {
      expect(metaToJsonProperty({type: Number})).to.eql({
        type: 'number',
      });
    });

    it('converts arrays', () => {
      expect(metaToJsonProperty({type: Array})).to.eql({
        type: 'array',
      });
    });

    it('converts complex types', () => {
      expect(metaToJsonProperty({type: CustomType})).to.eql({
        $ref: '#/definitions/CustomType',
      });
    });

    it('converts complex types with resolver', () => {
      expect(metaToJsonProperty({type: () => CustomType})).to.eql({
        $ref: '#/definitions/CustomType',
      });
    });

    it('converts primitive arrays', () => {
      expect(metaToJsonProperty({type: Array, itemType: Number})).to.eql({
        type: 'array',
        items: {type: 'number'},
      });
    });

    it('converts arrays of custom types', () => {
      expect(metaToJsonProperty({type: Array, itemType: CustomType})).to.eql({
        type: 'array',
        items: {$ref: '#/definitions/CustomType'},
      });
    });

    it('converts array types with resolver', () => {
      expect(
        metaToJsonProperty({type: Array, itemType: () => CustomType}),
      ).to.eql({
        type: 'array',
        items: {$ref: '#/definitions/CustomType'},
      });
    });
  });
});
