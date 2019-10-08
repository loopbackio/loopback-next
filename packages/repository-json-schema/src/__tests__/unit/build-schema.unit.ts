// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Model,
  model,
  property,
  PropertyDefinition,
  RelationDefinitionBase,
  RelationType,
} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  buildModelCacheKey,
  getNavigationalPropertyForRelation,
  metaToJsonProperty,
  modelToJsonSchema,
  stringTypeToWrapper,
} from '../..';

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

    it('keeps description on property', () => {
      expect(metaToJsonProperty({type: String, description: 'test'})).to.eql({
        type: 'string',
        description: 'test',
      });
    });

    it('keeps AJV keywords', () => {
      const schema = metaToJsonProperty({
        type: String,
        jsonSchema: {
          pattern: '(a|b|c)',
          format: 'email',
          maxLength: 50,
          minLength: 5,
        },
      });

      expect(schema).to.eql({
        type: 'string',
        pattern: '(a|b|c)',
        format: 'email',
        maxLength: 50,
        minLength: 5,
      });
    });
  });

  describe('modelToJsonSchema', () => {
    it('allows recursive model definition', () => {
      @model()
      class ReportState extends Model {
        @property.array(ReportState, {})
        states: ReportState[];

        @property({
          type: 'string',
        })
        benchmarkId?: string;

        @property({
          type: 'string',
        })
        color?: string;

        constructor(data?: Partial<ReportState>) {
          super(data);
        }
      }
      const schema = modelToJsonSchema(ReportState, {});
      expect(schema.properties).to.containEql({
        states: {
          type: 'array',
          items: {$ref: '#/definitions/ReportState'},
        },
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      });
      // No circular references in definitions
      expect(schema.definitions).to.be.undefined();
    });
  });

  describe('getNavigationalPropertyForRelation', () => {
    it('errors out if targetsMany is undefined', () => {
      expect(() =>
        getNavigationalPropertyForRelation(
          {
            type: RelationType.hasMany,
            name: 'Test',
          } as RelationDefinitionBase,
          {
            $ref: `#/definitions/Test`,
          },
        ),
      ).to.throw(/targetsMany attribute missing for Test/);
    });
  });

  describe('buildModelCacheKey', () => {
    it('returns "modelOnly" when no options were provided', () => {
      const key = buildModelCacheKey();
      expect(key).to.equal('modelOnly');
    });

    it('returns "modelWithRelations" when a single option "includeRelations" is set', () => {
      const key = buildModelCacheKey({includeRelations: true});
      expect(key).to.equal('modelWithRelations');
    });

    it('returns "partial" when a single option "partial" is set', () => {
      const key = buildModelCacheKey({partial: true});
      expect(key).to.equal('modelPartial');
    });

    it('returns "excluding_id-_rev_" when a single option "exclude" is set', () => {
      const key = buildModelCacheKey({exclude: ['id', '_rev']});
      expect(key).to.equal('modelExcluding_id-_rev_');
    });

    it('does not include "exclude" in concatenated option names if it is empty', () => {
      const key = buildModelCacheKey({
        partial: true,
        exclude: [],
        includeRelations: true,
      });
      expect(key).to.equal('modelPartialWithRelations');
    });

    it('returns "optional_id-_rev_" when "optional" is set with two items', () => {
      const key = buildModelCacheKey({optional: ['id', '_rev']});
      expect(key).to.equal('modelOptional_id-_rev_');
    });

    it('does not include "optional" in concatenated option names if it is empty', () => {
      const key = buildModelCacheKey({
        partial: true,
        optional: [],
        includeRelations: true,
      });
      expect(key).to.equal('modelPartialWithRelations');
    });

    it('does not include "partial" in option names if "optional" is not empty', () => {
      const key = buildModelCacheKey({
        partial: true,
        optional: ['name'],
      });
      expect(key).to.equal('modelOptional_name_');
    });

    it('includes "partial" in option names if "optional" is empty', () => {
      const key = buildModelCacheKey({
        partial: true,
        optional: [],
      });
      expect(key).to.equal('modelPartial');
    });

    it('returns concatenated option names except "partial" otherwise', () => {
      const key = buildModelCacheKey({
        // important: object keys are defined in reverse order
        partial: true,
        exclude: ['id', '_rev'],
        optional: ['name'],
        includeRelations: true,
      });
      expect(key).to.equal(
        'modelOptional_name_Excluding_id-_rev_WithRelations',
      );
    });

    it('includes custom title', () => {
      const key = buildModelCacheKey({title: 'NewProduct', partial: true});
      expect(key).to.equal('modelNewProductPartial');
    });
  });
});
