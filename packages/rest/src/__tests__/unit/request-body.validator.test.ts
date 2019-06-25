// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ReferenceObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3';
import {expect} from '@loopback/testlab';
import {RestHttpErrors, validateRequestBody} from '../../';
import {aBodySpec} from '../helpers';

const INVALID_MSG = RestHttpErrors.INVALID_REQUEST_BODY_MESSAGE;

const TODO_SCHEMA = {
  title: 'Todo',
  properties: {
    title: {type: 'string'},
    description: {type: 'string'},
    isComplete: {type: 'boolean'},
  },
  required: ['title'],
};

// a schema that contains a property with referenced schema
const ACCOUNT_SCHEMA = {
  title: 'Account',
  properties: {
    title: {type: 'string'},
    address: {$ref: '#/components/schemas/Address'},
  },
};

const ADDRESS_SCHEMA = {
  title: 'Address',
  properties: {
    city: {type: 'string'},
    unit: {type: 'number'},
    isOwner: {type: 'boolean'},
  },
};

const INVALID_ACCOUNT_SCHEMA = {
  title: 'Account',
  properties: {
    title: {type: 'string'},
    address: {$ref: '#/components/schemas/Invalid'},
  },
};

describe('validateRequestBody', () => {
  it('accepts valid data omitting optional properties', () => {
    validateRequestBody(
      {value: {title: 'work'}, schema: TODO_SCHEMA},
      aBodySpec(TODO_SCHEMA),
    );
  });

  // Test for https://github.com/strongloop/loopback-next/issues/3234
  it('honors options for AJV validator caching', () => {
    // 1. Trigger a validation with `{coerceTypes: false}`
    validateRequestBody(
      {
        value: {city: 'San Jose', unit: 123, isOwner: true},
        schema: ADDRESS_SCHEMA,
      },
      aBodySpec(ADDRESS_SCHEMA),
      {},
      {coerceTypes: false},
    );

    // 2. Trigger a validation with `{coerceTypes: true}`
    validateRequestBody(
      {
        value: {city: 'San Jose', unit: '123', isOwner: 'true'},
        schema: ADDRESS_SCHEMA,
      },
      aBodySpec(ADDRESS_SCHEMA),
      {},
      {coerceTypes: true},
    );

    // 3. Trigger a validation with `{coerceTypes: false}` with invalid data
    expect(() =>
      validateRequestBody(
        {
          value: {city: 'San Jose', unit: '123', isOwner: true},
          schema: ADDRESS_SCHEMA,
        },
        aBodySpec(ADDRESS_SCHEMA),
        {},
        {coerceTypes: false},
      ),
    ).to.throw(/The request body is invalid/);
  });

  it('rejects data missing a required property', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '',
        code: 'required',
        message: "should have required property 'title'",
        info: {missingProperty: 'title'},
      },
    ];
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {
        description: 'missing required "title"',
      },
      TODO_SCHEMA,
    );
  });

  it('rejects data containing values of a wrong type', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '.isComplete',
        code: 'type',
        message: 'should be boolean',
        info: {type: 'boolean'},
      },
    ];
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {
        title: 'todo with a string value of "isComplete"',
        isComplete: 'a string value',
      },
      TODO_SCHEMA,
    );
  });

  it('reports all validation errors', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '',
        code: 'required',
        message: "should have required property 'title'",
        info: {missingProperty: 'title'},
      },
      {
        path: '.isComplete',
        code: 'type',
        message: 'should be boolean',
        info: {type: 'boolean'},
      },
    ];
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {
        description: 'missing title and a string value of "isComplete"',
        isComplete: 'a string value',
      },
      TODO_SCHEMA,
    );
  });

  it('reports schema generation errors', () => {
    expect(() =>
      validateRequestBody({value: {}, schema: INVALID_ACCOUNT_SCHEMA}),
    ).to.throw(
      "can't resolve reference #/components/schemas/Invalid from id #",
    );
  });

  it('resolves schema references', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '',
        code: 'required',
        message: "should have required property 'title'",
        info: {missingProperty: 'title'},
      },
    ];
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {description: 'missing title'},
      {$ref: '#/components/schemas/Todo'},
      {Todo: TODO_SCHEMA},
    );
  });

  it('rejects empty values when body is required', () => {
    verifyValidationRejectsInputWithError(
      'Request body is required',
      'MISSING_REQUIRED_PARAMETER',
      undefined,
      null,
      TODO_SCHEMA,
      {},
      true,
    );
  });

  it('allows empty values when body is optional', () => {
    validateRequestBody(
      {value: null, schema: TODO_SCHEMA},
      aBodySpec(TODO_SCHEMA, {required: false}),
    );
  });

  it('rejects invalid values for number properties', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '.count',
        code: 'type',
        message: 'should be number',
        info: {type: 'number'},
      },
    ];
    const schema: SchemaObject = {
      properties: {
        count: {type: 'number'},
      },
    };
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {count: 'string value'},
      schema,
    );
  });

  context('rejects array of data with wrong type - ', () => {
    it('primitive types', () => {
      const details: RestHttpErrors.ValidationErrorDetails[] = [
        {
          path: '.orders[1]',
          code: 'type',
          message: 'should be string',
          info: {type: 'string'},
        },
      ];
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          orders: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      };
      verifyValidationRejectsInputWithError(
        INVALID_MSG,
        'VALIDATION_FAILED',
        details,
        {orders: ['order1', 1]},
        schema,
      );
    });

    it('first level $ref', () => {
      const details: RestHttpErrors.ValidationErrorDetails[] = [
        {
          path: '[1]',
          code: 'required',
          message: "should have required property 'title'",
          info: {missingProperty: 'title'},
        },
      ];
      const schema: SchemaObject = {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Todo',
        },
      };
      verifyValidationRejectsInputWithError(
        INVALID_MSG,
        'VALIDATION_FAILED',
        details,
        [{title: 'a good todo'}, {description: 'a todo item missing title'}],
        schema,
        {Todo: TODO_SCHEMA},
      );
    });

    it('nested $ref in schema', () => {
      const details: RestHttpErrors.ValidationErrorDetails[] = [
        {
          path: '.todos[1]',
          code: 'required',
          message: "should have required property 'title'",
          info: {missingProperty: 'title'},
        },
        {
          path: '.todos[2].title',
          code: 'type',
          message: 'should be string',
          info: {type: 'string'},
        },
      ];
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          todos: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Todo',
            },
          },
        },
      };
      verifyValidationRejectsInputWithError(
        INVALID_MSG,
        'VALIDATION_FAILED',
        details,
        {
          todos: [
            {title: 'a good todo'},
            {description: 'a todo item missing title'},
            {description: 'a todo with wrong type of title', title: 2},
          ],
        },
        schema,
        {Todo: TODO_SCHEMA},
      );
    });

    it('nested $ref in reference', () => {
      const details: RestHttpErrors.ValidationErrorDetails[] = [
        {
          path: '.accounts[0].address.city',
          code: 'type',
          message: 'should be string',
          info: {type: 'string'},
        },
      ];
      const schema: SchemaObject = {
        type: 'object',
        properties: {
          accounts: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Account',
            },
          },
        },
      };
      verifyValidationRejectsInputWithError(
        INVALID_MSG,
        'VALIDATION_FAILED',
        details,
        {
          accounts: [
            {title: 'an account with invalid address', address: {city: 1}},
          ],
        },
        schema,
        {Account: ACCOUNT_SCHEMA, Address: ADDRESS_SCHEMA},
      );
    });
  });
});

// ----- HELPERS ----- /

function verifyValidationRejectsInputWithError(
  expectedMessage: string,
  expectedCode: string,
  expectedDetails: RestHttpErrors.ValidationErrorDetails[] | undefined,
  body: object | null,
  schema: SchemaObject | ReferenceObject,
  schemas?: SchemasObject,
  required?: boolean,
) {
  try {
    validateRequestBody(
      {value: body, schema},
      aBodySpec(schema, {required}),
      schemas,
    );
    throw new Error(
      "expected Function { name: 'validateRequestBody' } to throw exception",
    );
  } catch (err) {
    expect(err.message).to.equal(expectedMessage);
    expect(err.code).to.equal(expectedCode);
    expect(err.details).to.deepEqual(expectedDetails);
  }
}
