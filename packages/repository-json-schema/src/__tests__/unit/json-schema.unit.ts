// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonSchema} from '../..';

describe('JSON Schema type', () => {
  describe('JsonSchema interface', () => {
    /**
     * The classes below are declared as tests for the Interfaces.
     * The TS Compiler will complain if an interface changes in a way
     * inconsistent with the JSON Schema definition.
     *
     * Inspired by https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/json-schema/json-schema-tests.ts
     */

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testSchema: JsonSchema = {
      $id: 'test',
      $ref: 'test/sub',
      $schema: 'http://json-schema.org/schema#',
      title: 'test',
      description: 'test description',
      default: 10,
      multipleOf: 5,
      maximum: 4,
      exclusiveMaximum: 20,
      minimum: 5,
      exclusiveMinimum: 5,
      maxLength: 7,
      minLength: 2,
      pattern: 'test pattern',
      additionalItems: true,
      items: [
        {
          type: 'string',
        },
      ],
      maxItems: 5,
      minItems: 4,
      uniqueItems: true,
      maxProperties: 5,
      minProperties: 12,
      required: ['foo', 'bar'],
      additionalProperties: true,
      definitions: {foo: {type: 'number'}},
      properties: {bar: {type: 'string'}},
      dependencies: {baz: {type: 'boolean'}},
      enum: ['foo', 23],
      type: 'string',
      allOf: [{type: 'string'}],
      anyOf: [{type: 'number'}],
      oneOf: [{type: 'boolean'}],
      not: {type: 'array'},
      const: 'test',
      contains: {type: 'string'},
      examples: [4],
      propertyNames: {enum: ['foo', 'bar']},
      format: 'email',
    };
  });
});
