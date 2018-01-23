// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {JsonDefinition} from '@loopback/repository-json-schema';
import {SchemaObject} from '@loopback/openapi-spec';
import {jsonToSchemaObject} from '../../../index';

describe('jsonToSchemaObject', () => {
  it('does nothing when given an empty object', () => {
    expect({}).to.eql({});
  });
  const typeDef: JsonDefinition = {type: ['string', 'number']};
  const expectedType: SchemaObject = {type: 'string'};
  it('converts type', () => {
    propertyConversionTest(typeDef, expectedType);
  });

  it('ignores non-compatible JSON schema properties', () => {
    const nonCompatibleDef: JsonDefinition = {
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
    const allOfDef: JsonDefinition = {
      allOf: [typeDef, typeDef],
    };
    const expectedAllOf: SchemaObject = {
      allOf: [expectedType, expectedType],
    };
    propertyConversionTest(allOfDef, expectedAllOf);
  });

  it('converts definitions', () => {
    const definitionsDef: JsonDefinition = {
      definitions: {foo: typeDef, bar: typeDef},
    };
    const expectedDef: SchemaObject = {
      definitions: {foo: expectedType, bar: expectedType},
    };
    propertyConversionTest(definitionsDef, expectedDef);
  });

  it('converts properties', () => {
    const propertyDef: JsonDefinition = {
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
    it('is converted properly when the type is JsonDefinition', () => {
      const additionalDef: JsonDefinition = {
        additionalProperties: typeDef,
      };
      const expectedAdditional: SchemaObject = {
        additionalProperties: expectedType,
      };
      propertyConversionTest(additionalDef, expectedAdditional);
    });

    it('is converted properly when it is "false"', () => {
      const noAdditionalDef: JsonDefinition = {
        additionalProperties: false,
      };
      const expectedDef: SchemaObject = {};
      propertyConversionTest(noAdditionalDef, expectedDef);
    });
  });

  it('converts items', () => {
    const itemsDef: JsonDefinition = {
      type: 'array',
      items: typeDef,
    };
    const expectedItems: SchemaObject = {
      type: 'array',
      items: expectedType,
    };
    propertyConversionTest(itemsDef, expectedItems);
  });

  context('enum', () => {
    it('is converted properly when the type is primitive', () => {
      const enumStringDef: JsonDefinition = {
        enum: ['foo', 'bar'],
      };
      const expectedStringDef: SchemaObject = {
        enum: ['foo', 'bar'],
      };
      propertyConversionTest(enumStringDef, expectedStringDef);
    });

    it('is converted properly when it is null', () => {
      const enumNullDef: JsonDefinition = {
        enum: [null, null],
      };
      const expectedNullDef: JsonDefinition = {
        enum: [null, null],
      };
      propertyConversionTest(enumNullDef, expectedNullDef);
    });

    it('is converted properly when the type is complex', () => {
      const enumCustomDef: JsonDefinition = {
        enum: [typeDef, typeDef],
      };
      const expectedCustomDef: SchemaObject = {
        enum: [expectedType, expectedType],
      };
      propertyConversionTest(enumCustomDef, expectedCustomDef);
    });
  });

  it('retains given properties in the conversion', () => {
    const inputDef: JsonDefinition = {
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
