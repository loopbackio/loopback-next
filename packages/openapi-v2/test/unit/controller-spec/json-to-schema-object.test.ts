import {expect} from '@loopback/testlab';
import {JsonDefinition} from '@loopback/repository-json-schema';
import {SchemaObject} from '@loopback/openapi-spec';
import {jsonToSchemaObject} from '../../../index';

describe('jsonToSchemaObject', () => {
  it('does nothing when given an empty object', () => {
    expect({}).to.eql({});
  });
  const typeDef = {type: ['string', 'number']};
  const expectedType = {type: 'string'};
  propertyConversionTest('type', typeDef, expectedType);

  const allOfDef: JsonDefinition = {
    allOf: [typeDef, typeDef],
  };
  const expectedAllOf: SchemaObject = {
    allOf: [expectedType, expectedType],
  };
  propertyConversionTest('allOf', allOfDef, expectedAllOf);

  const propertyDef: JsonDefinition = {
    type: 'object',
    properties: {
      foo: typeDef,
    },
  };
  const expectedProperties: SchemaObject = {
    type: 'object',
    properties: {
      foo: expectedType,
    },
  };
  propertyConversionTest('properties', propertyDef, expectedProperties);

  const additionalDef: JsonDefinition = {
    type: 'object',
    additionalProperties: typeDef,
  };
  const expectedAdditional: SchemaObject = {
    type: 'object',
    additionalProperties: expectedType,
  };
  propertyConversionTest(
    'additionalProperties',
    additionalDef,
    expectedAdditional,
  );

  const itemsDef: JsonDefinition = {
    type: 'array',
    items: typeDef,
  };
  const expectedItems: SchemaObject = {
    type: 'array',
    items: expectedType,
  };
  propertyConversionTest('items', itemsDef, expectedItems);

  it('retains given properties in the conversion', () => {
    const inputDef: JsonDefinition = {
      title: 'foo',
      type: 'object',
    };
    const expectedDef: SchemaObject = {
      title: 'foo',
      type: 'object',
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
  function propertyConversionTest(
    name: string,
    property: Object,
    expected: Object,
  ) {
    it(name, () => {
      expect(jsonToSchemaObject(property)).to.eql(expected);
    });
  }
});
