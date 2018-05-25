// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, property} from '@loopback/repository';
import {
  modelToJsonSchema,
  JSON_SCHEMA_KEY,
  getJsonSchema,
  JsonSchema,
} from '../..';
import {expect} from '@loopback/testlab';
import {MetadataInspector} from '@loopback/context';
import * as Ajv from 'ajv';

describe('build-schema', () => {
  describe('modelToJsonSchema', () => {
    context('properties conversion', () => {
      it('does not convert null or undefined property', () => {
        @model()
        class TestModel {
          @property() nul: null;
          @property() undef: undefined;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.not.have.keys(['nul', 'undef']);
        expectValidJsonSchema(jsonSchema);
      });

      it('does not convert properties that have not been decorated', () => {
        @model()
        class NoPropertyMeta {
          prop: string;
        }
        @model()
        class OnePropertyDecorated {
          @property() foo: string;
          bar: boolean;
          baz: number;
        }

        const noPropJson = modelToJsonSchema(NoPropertyMeta);
        const onePropJson = modelToJsonSchema(OnePropertyDecorated);
        expect(noPropJson).to.not.have.key('properties');
        expectValidJsonSchema(noPropJson);
        expect(onePropJson.properties).to.deepEqual({
          foo: {
            type: 'string',
          },
        });
        expectValidJsonSchema(onePropJson);
      });

      it('does not convert models that have not been decorated with @model()', () => {
        class Empty {}
        class NoModelMeta {
          @property() foo: string;
          bar: number;
        }

        const emptyJson = modelToJsonSchema(Empty);
        const noModelMetaJson = modelToJsonSchema(NoModelMeta);
        expect(emptyJson).to.eql({});
        expectValidJsonSchema(emptyJson);
        expect(noModelMetaJson).to.eql({});
        expectValidJsonSchema(noModelMetaJson);
      });

      it('infers "title" property from constructor name', () => {
        @model()
        class TestModel {
          @property() foo: string;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.title).to.eql('TestModel');
        expectValidJsonSchema(jsonSchema);
      });

      it('overrides "title" property if explicitly given', () => {
        @model({title: 'NewName'})
        class TestModel {
          @property() foo: string;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.title).to.eql('NewName');
        expectValidJsonSchema(jsonSchema);
      });

      it('retains "description" properties from top-level metadata', () => {
        const topMeta = {
          description: 'Test description',
        };
        @model(topMeta)
        class TestModel {
          @property() foo: string;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.description).to.eql(topMeta.description);
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts string, number, and boolean properties', () => {
        @model()
        class TestModel {
          @property() str: string;
          @property() num: number;
          @property() bool: boolean;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          str: {
            type: 'string',
          },
          num: {
            type: 'number',
          },
          bool: {
            type: 'boolean',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts object properties', () => {
        @model()
        class TestModel {
          @property() obj: object;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          obj: {
            type: 'object',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      context('with custom type properties', () => {
        it('properly converts undecorated custom type properties', () => {
          class CustomType {
            prop: string;
          }

          @model()
          class TestModel {
            @property() cusType: CustomType;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            cusType: {
              $ref: '#/definitions/CustomType',
            },
          });
          expect(jsonSchema).to.not.have.key('definitions');
          expectValidJsonSchema(jsonSchema);
        });

        it('properly converts decorated custom type properties', () => {
          @model()
          class CustomType {
            @property() prop: string;
          }

          @model()
          class TestModel {
            @property() cusType: CustomType;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          expect(jsonSchema.properties).to.deepEqual({
            cusType: {
              $ref: '#/definitions/CustomType',
            },
          });
          expect(jsonSchema.definitions).to.deepEqual({
            CustomType: {
              title: 'CustomType',
              properties: {
                prop: {
                  type: 'string',
                },
              },
            },
          });
          expectValidJsonSchema(jsonSchema);
        });

        it('creates definitions only at the root level of the schema', () => {
          @model()
          class CustomTypeFoo {
            @property() prop: string;
          }

          @model()
          class CustomTypeBar {
            @property.array(CustomTypeFoo) prop: CustomTypeFoo[];
          }

          @model()
          class TestModel {
            @property() cusBar: CustomTypeBar;
          }

          const jsonSchema = modelToJsonSchema(TestModel);
          const schemaProps = jsonSchema.properties;
          const schemaDefs = jsonSchema.definitions;
          expect(schemaProps).to.deepEqual({
            cusBar: {
              $ref: '#/definitions/CustomTypeBar',
            },
          });
          expect(schemaDefs).to.deepEqual({
            CustomTypeFoo: {
              title: 'CustomTypeFoo',
              properties: {
                prop: {
                  type: 'string',
                },
              },
            },
            CustomTypeBar: {
              title: 'CustomTypeBar',
              properties: {
                prop: {
                  type: 'array',
                  items: {
                    $ref: '#/definitions/CustomTypeFoo',
                  },
                },
              },
            },
          });
          expectValidJsonSchema(jsonSchema);
        });
      });

      it('properly converts primitive arrays properties', () => {
        @model()
        class TestModel {
          @property.array(Number) numArr: number[];
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          numArr: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('properly converts custom type arrays properties', () => {
        class CustomType {
          prop: string;
        }

        @model()
        class TestModel {
          @property.array(CustomType) cusArr: CustomType[];
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          cusArr: {
            type: 'array',
            items: {
              $ref: '#/definitions/CustomType',
            },
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('supports explicit primitive type decoration via strings', () => {
        @model()
        class TestModel {
          @property({type: 'string'})
          hardStr: Number;
          @property({type: 'boolean'})
          hardBool: String;
          @property({type: 'number'})
          hardNum: Boolean;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.properties).to.deepEqual({
          hardStr: {
            type: 'string',
          },
          hardBool: {
            type: 'boolean',
          },
          hardNum: {
            type: 'number',
          },
        });
        expectValidJsonSchema(jsonSchema);
      });

      it('maps "required" keyword to the schema appropriately', () => {
        @model()
        class TestModel {
          @property({required: false})
          propOne: string;
          @property({required: true})
          propTwo: string;
          @property() propThree: number;
        }

        const jsonSchema = modelToJsonSchema(TestModel);
        expect(jsonSchema.required).to.deepEqual(['propTwo']);
        expectValidJsonSchema(jsonSchema);
      });

      it('errors out when explicit type decoration is not primitive', () => {
        @model()
        class TestModel {
          @property({type: 'NotPrimitive'})
          bad: String;
        }

        expect(() => modelToJsonSchema(TestModel)).to.throw(/Unsupported type/);
      });

      it('errors out when "@property.array" is not used on an array', () => {
        @model()
        class BadArray {
          @property() badArr: string[];
        }

        expect(() => {
          modelToJsonSchema(BadArray);
        }).to.throw(/type is defined as an array/);
      });

      it('errors out if "@property.array" is given "Array" as parameter', () => {
        @model()
        class BadArray {
          @property.array(Array) badArr: string[][];
        }

        expect(() => {
          modelToJsonSchema(BadArray);
        }).to.throw(/type is defined as an array/);
      });
    });

    function expectValidJsonSchema(schema: JsonSchema) {
      const ajv = new Ajv();
      const validate = ajv.compile(
        require('ajv/lib/refs/json-schema-draft-06.json'),
      );
      const isValid = validate(schema);
      const result = isValid
        ? 'JSON Schema is valid'
        : ajv.errorsText(validate.errors!);
      expect(result).to.equal('JSON Schema is valid');
    }
  });

  describe('getjsonSchema', () => {
    it('gets cached JSON schema if one exists', () => {
      @model()
      class TestModel {
        @property() foo: number;
      }
      const cachedSchema: JsonSchema = {
        properties: {
          cachedProperty: {
            type: 'string',
          },
        },
      };
      MetadataInspector.defineMetadata(
        JSON_SCHEMA_KEY,
        cachedSchema,
        TestModel,
      );

      const jsonSchema = getJsonSchema(TestModel);
      expect(jsonSchema).to.eql(cachedSchema);
    });

    it('creates JSON schema if one does not already exist', () => {
      @model()
      class NewModel {
        @property() newProperty: string;
      }

      const jsonSchema = getJsonSchema(NewModel);
      expect(jsonSchema.properties).to.deepEqual({
        newProperty: {
          type: 'string',
        },
      });
    });
  });
});
