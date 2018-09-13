// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {validateRequestBody} from '../../src/validation/request-body.validator';
import {RestHttpErrors} from '../../';
import {aBodySpec} from '../helpers';
import {
  RequestBodyObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';

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
    validateRequestBody({title: 'work'}, aBodySpec(TODO_SCHEMA));
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
      details,
      {
        description: 'missing required "title"',
      },
      aBodySpec(TODO_SCHEMA),
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
      details,
      {
        title: 'todo with a string value of "isComplete"',
        isComplete: 'a string value',
      },
      aBodySpec(TODO_SCHEMA),
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
      details,
      {
        description: 'missing title and a string value of "isComplete"',
        isComplete: 'a string value',
      },
      aBodySpec(TODO_SCHEMA),
    );
  });

  it('reports schema generation errors', () => {
    expect(() =>
      validateRequestBody({}, aBodySpec(INVALID_ACCOUNT_SCHEMA)),
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
      details,
      {description: 'missing title'},
      aBodySpec({$ref: '#/components/schemas/Todo'}),
      {Todo: TODO_SCHEMA},
    );
  });

  it('rejects empty values when body is required', () => {
    verifyValidationRejectsInputWithError(
      'Request body is required',
      undefined,
      null,
      aBodySpec(TODO_SCHEMA, {required: true}),
    );
  });

  it('allows empty values when body is optional', () => {
    validateRequestBody(null, aBodySpec(TODO_SCHEMA, {required: false}));
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
      details,
      {count: 'string value'},
      aBodySpec(schema),
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
        details,
        {orders: ['order1', 1]},
        aBodySpec(schema),
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
        details,
        [{title: 'a good todo'}, {description: 'a todo item missing title'}],
        aBodySpec(schema),
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
        details,
        {
          todos: [
            {title: 'a good todo'},
            {description: 'a todo item missing title'},
            {description: 'a todo with wrong type of title', title: 2},
          ],
        },
        aBodySpec(schema),
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
        details,
        {
          accounts: [
            {title: 'an account with invalid address', address: {city: 1}},
          ],
        },
        aBodySpec(schema),
        {Account: ACCOUNT_SCHEMA, Address: ADDRESS_SCHEMA},
      );
    });
  });
});

// ----- HELPERS ----- /

function verifyValidationRejectsInputWithError(
  errorMatcher: Error | RegExp | string,
  details: RestHttpErrors.ValidationErrorDetails[] | undefined,
  body: object | null,
  spec: RequestBodyObject | undefined,
  schemas?: SchemasObject,
) {
  try {
    validateRequestBody(body, spec, schemas);
    throw new Error(
      "expected Function { name: 'validateRequestBody' } to throw exception",
    );
  } catch (err) {
    expect(err.message).to.equal(errorMatcher);
    expect(err.details).to.deepEqual(details);
  }
}
