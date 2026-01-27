// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonSchema} from '@loopback/repository-json-schema';
import {expect} from '@loopback/testlab';
import {
  isSchemaObject,
  jsonOrBooleanToJSON,
  jsonToSchemaObject,
  SchemaObject,
} from '../..';

describe('json-to-schema advanced tests', () => {
  describe('jsonToSchemaObject - complex schemas', () => {
    it('handles deeply nested allOf structures', () => {
      const jsonSchema: JsonSchema = {
        allOf: [
          {
            type: 'object',
            properties: {
              id: {type: 'number'},
            },
          },
          {
            allOf: [
              {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                },
              },
              {
                type: 'object',
                properties: {
                  email: {type: 'string'},
                },
              },
            ],
          },
        ],
      };

      const result = jsonToSchemaObject(jsonSchema);
      expect(result).to.have.property('allOf');
      if (isSchemaObject(result)) {
        expect(result.allOf).to.be.Array();
        expect(result.allOf).to.have.length(2);
      }
    });

    it('handles oneOf with multiple schemas', () => {
      const jsonSchema: JsonSchema = {
        oneOf: [{type: 'string'}, {type: 'number'}, {type: 'boolean'}],
      };

      const result = jsonToSchemaObject(jsonSchema);
      expect(result).to.have.property('oneOf');
      if (isSchemaObject(result)) {
        expect(result.oneOf).to.have.length(3);
      }
    });

    it('converts $ref from definitions to components/schemas', () => {
      const jsonSchema: JsonSchema = {
        $ref: '#/definitions/MyModel',
      };

      const result = jsonToSchemaObject(jsonSchema);
      expect(result.$ref).to.equal('#/components/schemas/MyModel');
    });

    it('handles nested $refs in properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        properties: {
          user: {$ref: '#/definitions/User'},
          address: {$ref: '#/definitions/Address'},
        },
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result) && result.properties) {
        expect(result.properties.user).to.have.property('$ref');
        expect(result.properties.user.$ref).to.equal(
          '#/components/schemas/User',
        );
        expect(result.properties.address.$ref).to.equal(
          '#/components/schemas/Address',
        );
      }
    });
  });

  describe('jsonToSchemaObject - array handling', () => {
    it('handles array type with items', () => {
      const jsonSchema: JsonSchema = {
        type: 'array',
        items: {type: 'string'},
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.type).to.equal('array');
        expect(result.items).to.eql({type: 'string'});
      }
    });

    it('handles array with multiple item types (takes first)', () => {
      const jsonSchema: JsonSchema = {
        type: 'array',
        items: [{type: 'string'}, {type: 'number'}],
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.type).to.equal('array');
        expect(result.items).to.eql({type: 'string'});
      }
    });

    it('throws error for array without items', () => {
      const jsonSchema: JsonSchema = {
        type: 'array',
      };

      expect(() => jsonToSchemaObject(jsonSchema)).to.throw(
        '"items" property must be present if "type" is an array',
      );
    });

    it('handles array with complex item schema', () => {
      const jsonSchema: JsonSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'number'},
            name: {type: 'string'},
          },
        },
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (
        isSchemaObject(result) &&
        result.items &&
        isSchemaObject(result.items)
      ) {
        expect(result.items.type).to.equal('object');
        expect(result.items).to.have.property('properties');
      }
    });
  });

  describe('jsonToSchemaObject - additionalProperties', () => {
    it('handles boolean additionalProperties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        additionalProperties: true,
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.additionalProperties).to.be.true();
      }
    });

    it('handles schema additionalProperties', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        additionalProperties: {type: 'string'},
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.additionalProperties).to.eql({type: 'string'});
      }
    });

    it('handles complex additionalProperties schema', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            value: {type: 'number'},
          },
        },
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (
        isSchemaObject(result) &&
        result.additionalProperties &&
        typeof result.additionalProperties !== 'boolean' &&
        isSchemaObject(result.additionalProperties)
      ) {
        expect(result.additionalProperties.type).to.equal('object');
        expect(result.additionalProperties).to.have.property('properties');
      }
    });
  });

  describe('jsonToSchemaObject - definitions', () => {
    it('converts definitions to components/schemas format', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        definitions: {
          User: {
            type: 'object',
            properties: {
              id: {type: 'number'},
              name: {type: 'string'},
            },
          },
          Address: {
            type: 'object',
            properties: {
              street: {type: 'string'},
            },
          },
        },
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result).to.have.property('definitions');
        expect(result.definitions).to.have.property('User');
        expect(result.definitions).to.have.property('Address');
      }
    });

    it('handles nested definitions with references', () => {
      const jsonSchema: JsonSchema = {
        definitions: {
          Parent: {
            type: 'object',
            properties: {
              child: {$ref: '#/definitions/Child'},
            },
          },
          Child: {
            type: 'object',
            properties: {
              name: {type: 'string'},
            },
          },
        },
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (
        isSchemaObject(result) &&
        result.definitions &&
        isSchemaObject(result.definitions.Parent) &&
        result.definitions.Parent.properties
      ) {
        expect(result.definitions.Parent.properties.child).to.have.property(
          '$ref',
        );
        expect(result.definitions.Parent.properties.child.$ref).to.equal(
          '#/components/schemas/Child',
        );
      }
    });
  });

  describe('jsonToSchemaObject - type handling', () => {
    it('handles array of types (takes first)', () => {
      const jsonSchema: JsonSchema = {
        type: ['string', 'null'],
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.type).to.equal('string');
      }
    });

    it('handles single type', () => {
      const jsonSchema: JsonSchema = {
        type: 'number',
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.type).to.equal('number');
      }
    });
  });

  describe('jsonToSchemaObject - examples', () => {
    it('converts examples array to single example', () => {
      const jsonSchema: JsonSchema = {
        type: 'string',
        examples: ['example1', 'example2', 'example3'],
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result).to.have.property('example');
        expect(result.example).to.equal('example1');
        expect(result).to.not.have.property('examples');
      }
    });

    it('handles empty examples array', () => {
      const jsonSchema: JsonSchema = {
        type: 'string',
        examples: [],
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.example).to.be.undefined();
      }
    });
  });

  describe('jsonToSchemaObject - TypeScript type extraction', () => {
    it('extracts x-typescript-type from description', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        description: '(tsType: MyCustomType, schemaOptions: {...})',
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result).to.have.property('x-typescript-type', 'MyCustomType');
      }
    });

    it('preserves description without tsType', () => {
      const jsonSchema: JsonSchema = {
        type: 'object',
        description: 'This is a regular description',
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.description).to.equal('This is a regular description');
        expect(result).to.not.have.property('x-typescript-type');
      }
    });
  });

  describe('jsonToSchemaObject - circular references', () => {
    it('handles circular references with visited map', () => {
      const jsonSchema: JsonSchema = {
        title: 'Node',
        type: 'object',
        properties: {
          value: {type: 'string'},
          children: {
            type: 'array',
            items: {$ref: '#/definitions/Node'},
          },
        },
        definitions: {
          Node: {
            title: 'Node',
            type: 'object',
            properties: {
              value: {type: 'string'},
            },
          },
        },
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result).to.have.property('properties');
        expect(result.properties).to.have.property('children');
      }
    });
  });

  describe('jsonToSchemaObject - ignored properties', () => {
    it('ignores additionalItems property', () => {
      const jsonSchema: JsonSchema = {
        type: 'array',
        items: {type: 'string'},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        additionalItems: {type: 'number'} as any,
      };

      const result = jsonToSchemaObject(jsonSchema);
      expect(result).to.not.have.property('additionalItems');
    });
  });

  describe('jsonOrBooleanToJSON', () => {
    it('returns object as-is', () => {
      const schema: JsonSchema = {type: 'string'};
      const result = jsonOrBooleanToJSON(schema);
      expect(result).to.equal(schema);
    });

    it('converts true to empty object', () => {
      const result = jsonOrBooleanToJSON(true);
      expect(result).to.eql({});
    });

    it('converts false to not schema', () => {
      const result = jsonOrBooleanToJSON(false);
      expect(result).to.eql({not: {}});
    });
  });

  describe('jsonToSchemaObject - property preservation', () => {
    it('preserves standard OpenAPI properties', () => {
      const jsonSchema: JsonSchema = {
        type: 'string',
        title: 'Test Title',
        description: 'Test Description',
        default: 'default value',
        enum: ['value1', 'value2'],
        format: 'email',
        pattern: '^[a-z]+$',
        minLength: 5,
        maxLength: 50,
      };

      const result = jsonToSchemaObject(jsonSchema) as SchemaObject;
      if (isSchemaObject(result)) {
        expect(result.title).to.equal('Test Title');
        expect(result.description).to.equal('Test Description');
        expect(result.default).to.equal('default value');
        expect(result.enum).to.eql(['value1', 'value2']);
        expect(result.format).to.equal('email');
        expect(result.pattern).to.equal('^[a-z]+$');
        expect(result.minLength).to.equal(5);
        expect(result.maxLength).to.equal(50);
      }
    });

    it('preserves numeric constraints', () => {
      const jsonSchema: JsonSchema = {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5,
      };

      const result = jsonToSchemaObject(jsonSchema);
      if (isSchemaObject(result)) {
        expect(result.minimum).to.equal(0);
        expect(result.maximum).to.equal(100);
        expect(result.multipleOf).to.equal(5);
      }
    });
  });
});

// Made with Bob
