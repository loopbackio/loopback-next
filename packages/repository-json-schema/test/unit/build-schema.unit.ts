// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PropertyDefinition} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {metaToJsonProperty, stringTypeToWrapper} from '../..';

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

  describe('metaToJsonSchema', () => {
    it('errors out if "itemType" is an array', () => {
      expect(() => metaToJsonProperty({type: Array, itemType: []})).to.throw(
        /itemType as an array is not supported/,
      );
    });

    it('converts Boolean', () => {
      expect(metaToJsonProperty({type: Boolean})).to.eql({
        type: 'boolean',
      });
    });

    it('converts String', () => {
      expect(metaToJsonProperty({type: String})).to.eql({
        type: 'string',
      });
    });

    it('converts Number', () => {
      expect(metaToJsonProperty({type: Number})).to.eql({
        type: 'number',
      });
    });

    it('converts Date', () => {
      expect(metaToJsonProperty({type: Date})).to.eql({
        type: 'string',
        format: 'date-time',
      });
    });

    it('converts Object', () => {
      expect(metaToJsonProperty({type: Object})).to.eql({
        type: 'object',
      });
    });

    it('converts Array', () => {
      expect(metaToJsonProperty({type: Array})).to.eql({
        type: 'array',
      });
    });

    it('converts "boolean" in strings', () => {
      expect(metaToJsonProperty({type: 'boolean'})).to.eql({
        type: 'boolean',
      });
    });

    it('converts "string" in strings', () => {
      expect(metaToJsonProperty({type: 'string'})).to.eql({
        type: 'string',
      });
    });

    it('converts "date" in strings', () => {
      expect(metaToJsonProperty({type: 'date'})).to.eql({
        type: 'string',
        format: 'date-time',
      });
    });

    it('converts "object" in strings', () => {
      expect(metaToJsonProperty({type: 'object'})).to.eql({
        type: 'object',
      });
    });

    it('converts "array" in strings', () => {
      expect(metaToJsonProperty({type: 'array'})).to.eql({
        type: 'array',
      });
    });

    it('converts complex types', () => {
      expect(metaToJsonProperty({type: CustomType})).to.eql({
        $ref: '#/definitions/CustomType',
      });
    });

    it('converts complex types with resolver', () => {
      const propDef: PropertyDefinition = {type: () => CustomType};
      expect(metaToJsonProperty(propDef)).to.eql({
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

    it('converts arrays of resolved types', () => {
      const propDef: PropertyDefinition = {
        type: Array,
        itemType: () => CustomType,
      };
      expect(metaToJsonProperty(propDef)).to.eql({
        type: 'array',
        items: {$ref: '#/definitions/CustomType'},
      });
    });
  });
});
