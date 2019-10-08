// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonSchema} from '@loopback/repository-json-schema';
import {expect} from '@loopback/testlab';
import {jsonOrBooleanToJSON, jsonToSchemaObject, SchemaObject} from '../..';

describe('jsonToSchemaObject', () => {
  it('does nothing when given an empty object', () => {
    expect({}).to.eql({});
  });
  const typeDef: JsonSchema = {type: ['string', 'number']};
  const expectedType: SchemaObject = {type: 'string'};
  it('converts type', () => {
    propertyConversionTest(typeDef, expectedType);
  });

  it('ignores non-compatible JSON schema properties', () => {
    const nonCompatibleDef = {
      anyOf: [],
      oneOf: [],
      additionalItems: {
        anyOf: [],
      },
      defaultProperties: [],
      typeof: 'function',
    };
    const expectedDef: SchemaObject = {};
    propertyConversionTest(nonCompatibleDef, expectedDef);
  });

  it('converts allOf', () => {
    const allOfDef: JsonSchema = {
      allOf: [typeDef, typeDef],
    };
    const expectedAllOf: SchemaObject = {
      allOf: [expectedType, expectedType],
    };
    propertyConversionTest(allOfDef, expectedAllOf);
  });

  it('converts definitions', () => {
    const definitionsDef: JsonSchema = {
      definitions: {foo: typeDef, bar: typeDef},
    };
    const expectedDef: SchemaObject = {
      definitions: {foo: expectedType, bar: expectedType},
    };
    propertyConversionTest(definitionsDef, expectedDef);
  });

  it('converts properties', () => {
    const propertyDef: JsonSchema = {
      properties: {
        foo: typeDef,
      },
    };
    const expectedProperties: SchemaObject = {
      properties: {
        foo: expectedType,
      },
    };
    propertyConversionTest(propertyDef, expectedProperties);
  });

  context('additionalProperties', () => {
    it('is converted properly when the type is JsonSchema', () => {
      const additionalDef: JsonSchema = {
        additionalProperties: typeDef,
      };
      const expectedAdditional: SchemaObject = {
        additionalProperties: expectedType,
      };
      propertyConversionTest(additionalDef, expectedAdditional);
    });

    it('is converted properly when it is "false"', () => {
      const jsonSchema: JsonSchema = {
        additionalProperties: false,
      };

      const openApiSchema = jsonToSchemaObject(jsonSchema);

      expect(openApiSchema).to.deepEqual({
        additionalProperties: false,
      });
    });

    it('is converted properly when it is "true"', () => {
      const jsonSchema: JsonSchema = {
        additionalProperties: true,
      };

      const openApiSchema = jsonToSchemaObject(jsonSchema);

      expect(openApiSchema).to.deepEqual({
        additionalProperties: true,
      });
    });
  });

  it('converts items', () => {
    const itemsDef: JsonSchema = {
      type: 'array',
      items: typeDef,
    };
    const expectedItems: SchemaObject = {
      type: 'array',
      items: expectedType,
    };
    propertyConversionTest(itemsDef, expectedItems);
  });

  it('retains given properties in the conversion', () => {
    const inputDef: JsonSchema = {
      title: 'foo',
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
      },
      additionalProperties: false,
      default: 'Default string',
    };
    const expectedDef: SchemaObject = {
      title: 'foo',
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
      },
      additionalProperties: false,
      default: 'Default string',
    };
    expect(jsonToSchemaObject(inputDef)).to.eql(expectedDef);
  });

  it('handles circular references with $ref', () => {
    const schemaJson: JsonSchema = {
      title: 'ReportState',
      properties: {
        // ReportState[]
        states: {type: 'array', items: {$ref: '#/definitions/ReportState'}},
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
    };
    const schema = jsonToSchemaObject(schemaJson);
    expect(schema).to.eql({
      title: 'ReportState',
      properties: {
        states: {
          type: 'array',
          items: {$ref: '#/components/schemas/ReportState'},
        },
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
    });
  });

  it('handles circular references with object', () => {
    const schemaJson: JsonSchema = {
      title: 'ReportState',
      properties: {
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
    };
    // Add states: ReportState[]
    schemaJson.properties!.states = {type: 'array', items: schemaJson};
    const schema = jsonToSchemaObject(schemaJson);
    expect(schema).to.eql({
      title: 'ReportState',
      properties: {
        states: {
          type: 'array',
          items: {$ref: '#/components/schemas/ReportState'},
        },
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
    });
  });

  it('handles indirect circular references with $ref', () => {
    const schemaJson: JsonSchema = {
      title: 'ReportState',
      properties: {
        parentState: {$ref: '#/definitions/ParentState'},
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
      definitions: {
        ParentState: {
          title: 'ParentState',
          properties: {
            timestamp: {type: 'string'},
            state: {$ref: '#/definitions/ReportState'},
          },
        },
      },
    };
    const schema = jsonToSchemaObject(schemaJson);
    expect(schema).to.eql({
      title: 'ReportState',
      properties: {
        parentState: {$ref: '#/components/schemas/ParentState'},
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
      definitions: {
        ParentState: {
          title: 'ParentState',
          properties: {
            timestamp: {type: 'string'},
            state: {$ref: '#/components/schemas/ReportState'},
          },
        },
      },
    });
  });

  it('handles indirect circular references with object', () => {
    const parentStateSchema: JsonSchema = {
      title: 'ParentState',
      properties: {
        timestamp: {type: 'string'},
        // state: {$ref: '#/definitions/ReportState'},
      },
    };

    const schemaJson: JsonSchema = {
      title: 'ReportState',
      properties: {
        parentState: {$ref: '#/definitions/ParentState'},
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
      definitions: {
        ParentState: parentStateSchema,
      },
    };

    parentStateSchema.properties!.state = schemaJson;

    const schema = jsonToSchemaObject(schemaJson);
    expect(schema).to.eql({
      title: 'ReportState',
      properties: {
        parentState: {$ref: '#/components/schemas/ParentState'},
        benchmarkId: {type: 'string'},
        color: {type: 'string'},
      },
      definitions: {
        ParentState: {
          title: 'ParentState',
          properties: {
            timestamp: {type: 'string'},
            state: {$ref: '#/components/schemas/ReportState'},
          },
        },
      },
    });
  });

  it('errors if type is an array and items is missing', () => {
    expect.throws(
      () => {
        jsonToSchemaObject({type: 'array'});
      },
      Error,
      '"items" property must be present if "type" is an array',
    );
  });

  it('copies first example from examples', () => {
    const itemsDef: JsonSchema = {
      type: 'integer',
      examples: [100, 500],
    };
    const expectedItems: SchemaObject = {
      type: 'integer',
      example: 100,
      examples: [100, 500],
    };
    propertyConversionTest(itemsDef, expectedItems);
  });

  // Helper function to check conversion of JSON Schema properties
  // to Swagger versions
  function propertyConversionTest(property: object, expected: object) {
    expect(jsonToSchemaObject(property)).to.deepEqual(expected);
  }
});

describe('jsonOrBooleanToJson', () => {
  it('converts true to {}', () => {
    expect(jsonOrBooleanToJSON(true)).to.eql({});
  });

  it('converts false to {}', () => {
    expect(jsonOrBooleanToJSON(false)).to.eql({not: {}});
  });

  it('makes no changes to JSON Schema', () => {
    const jsonSchema: JsonSchema = {
      properties: {
        number: {type: 'number'},
      },
    };
    expect(jsonOrBooleanToJSON(jsonSchema)).to.eql(jsonSchema);
  });
});
