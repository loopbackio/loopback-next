// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  hasMany,
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
  JsonSchema,
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

      it('returns  for "object"', () => {
        expect(stringTypeToWrapper('object')).to.eql(Object);
      });

      it('returns AnyType for "any"', () => {
        expect(stringTypeToWrapper('any')).to.eql(Object);
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

    it('converts type any', () => {
      expect(metaToJsonProperty({type: 'any'})).to.eql({});
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
    it('allows jsonSchema in model definition', () => {
      @model({
        jsonSchema: {
          title: 'report-state',
          required: ['color'],
        } as JsonSchema,
      })
      class ReportState extends Model {
        @property({
          type: 'string',
        })
        benchmarkId?: string;

        @property({
          type: 'string',
        })
        color: string;

        constructor(data?: Partial<ReportState>) {
          super(data);
        }
      }
      const schema = modelToJsonSchema(ReportState, {});
      expect(schema.properties).to.containEql({
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      });
      expect(schema.required).to.eql(['color']);
      expect(schema.title).to.eql('report-state');
      // No circular references in definitions
      expect(schema.definitions).to.be.undefined();
    });

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

    it('relation model definition does not inherit title from source model', () => {
      @model()
      class Child extends Entity {
        @property({
          type: 'string',
        })
        name?: string;
      }
      @model()
      class Parent extends Entity {
        @hasMany(() => Child)
        children: Child[];

        @property({
          type: 'string',
        })
        benchmarkId?: string;

        @property({
          type: 'string',
        })
        color?: string;

        constructor(data?: Partial<Parent>) {
          super(data);
        }
      }
      const schema = modelToJsonSchema(Parent, {
        title: 'ParentWithItsChildren',
        includeRelations: true,
      });
      expect(schema.properties).to.containEql({
        children: {
          type: 'array',
          // The reference here should be `ChildWithRelations`,
          // instead of `ParentWithItsChildren`
          items: {$ref: '#/definitions/ChildWithRelations'},
        },
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      });
      // The recursive calls should NOT inherit
      // `title` from the previous call's `options`.
      // So the `title` here is `ChildWithRelations`
      // instead of `ParentWithItsChildren`.
      expect(schema.definitions).to.containEql({
        ChildWithRelations: {
          title: 'ChildWithRelations',
          description:
            '(tsType: ChildWithRelations, schemaOptions: { includeRelations: true })',
          properties: {name: {type: 'string'}},
          additionalProperties: false,
        },
      });
    });

    it('property definition does not inherit title from model', () => {
      @model()
      class Child extends Entity {
        @property({
          type: 'string',
        })
        name?: string;
      }
      @model()
      class Parent extends Entity {
        @property.array(Child)
        children: Child[];

        @property({
          type: 'string',
        })
        benchmarkId?: string;

        @property({
          type: 'string',
        })
        color?: string;

        constructor(data?: Partial<Parent>) {
          super(data);
        }
      }
      const schema = modelToJsonSchema(Parent, {
        title: 'ParentWithPropertyChildren',
      });
      expect(schema.properties).to.containEql({
        children: {
          type: 'array',
          // The reference here should be `Child`,
          // instead of `ParentWithPropertyChildren`
          items: {$ref: '#/definitions/Child'},
        },
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      });
      // The recursive calls should NOT inherit
      // `title` from the previous call's `options`.
      // So the `title` here is `Child`
      // instead of `ParentWithPropertyChildren`.
      expect(schema.definitions).to.containEql({
        Child: {
          title: 'Child',
          properties: {name: {type: 'string'}},
          additionalProperties: false,
        },
      });
    });

    it('allows model inheritance', () => {
      @model()
      class User {
        @property({id: true})
        id: string;

        @property({
          type: 'string',
          required: true,
        })
        name: string;
      }

      @model()
      class NewUser extends User {
        @property({
          type: 'string',
          required: true,
        })
        password: string;
      }

      const userSchema = modelToJsonSchema(User, {});
      expect(userSchema).to.eql({
        title: 'User',
        properties: {id: {type: 'string'}, name: {type: 'string'}},
        required: ['name'],
        additionalProperties: false,
      });
      const newUserSchema = modelToJsonSchema(NewUser, {});
      expect(newUserSchema).to.eql({
        title: 'NewUser',
        properties: {
          id: {type: 'string'},
          name: {type: 'string'},
          password: {type: 'string'},
        },
        required: ['name', 'password'],
        additionalProperties: false,
      });
    });

    it('allows nesting models', () => {
      @model()
      class Address {
        @property()
        street: string;

        @property()
        city: string;

        @property()
        state: string;
      }

      @model()
      class Email {
        @property()
        label: string;

        @property()
        id: string;
      }

      @model()
      class User {
        @property({id: true})
        id: string;

        @property({
          type: 'string',
          required: true,
        })
        name: string;

        @property({
          type: Address,
        })
        address?: Address;

        @property.array(Email)
        emails: Email[];
      }

      const userSchema = modelToJsonSchema(User, {});
      expect(userSchema).to.eql({
        title: 'User',
        properties: {
          id: {type: 'string'},
          name: {type: 'string'},
          address: {$ref: '#/definitions/Address'},
          emails: {type: 'array', items: {$ref: '#/definitions/Email'}},
        },
        required: ['name'],
        definitions: {
          Address: {
            title: 'Address',
            properties: {
              street: {type: 'string'},
              city: {type: 'string'},
              state: {type: 'string'},
            },
            additionalProperties: false,
          },
          Email: {
            title: 'Email',
            properties: {
              label: {type: 'string'},
              id: {type: 'string'},
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      });
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
