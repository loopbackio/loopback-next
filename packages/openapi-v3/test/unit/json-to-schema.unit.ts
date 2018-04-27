// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {SchemaObject} from '@loopback/openapi-v3-types';
import {jsonToSchemaObject, jsonOrBooleanToJSON} from '../..';
import {JsonSchema} from '@loopback/repository-json-schema';

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
      const noAdditionalDef: JsonSchema = {
        additionalProperties: false,
      };
      const expectedDef: SchemaObject = {};
      propertyConversionTest(noAdditionalDef, expectedDef);
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
      default: 'Default string',
    };
    expect(jsonToSchemaObject(inputDef)).to.eql(expectedDef);
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

  // Helper function to check conversion of JSON Schema properties
  // to Swagger versions
  function propertyConversionTest(property: Object, expected: Object) {
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
