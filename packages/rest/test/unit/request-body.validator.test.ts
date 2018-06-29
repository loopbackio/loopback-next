// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {validateRequestBody} from '../../src/validation/request-body.validator';
import {aBodySpec} from '../helpers';
import {RequestBodyObject, SchemasObject} from '@loopback/openapi-v3-types';

const TODO_SCHEMA = {
  title: 'Todo',
  properties: {
    title: {type: 'string'},
    description: {type: 'string'},
    isComplete: {type: 'boolean'},
  },
  required: ['title'],
};

describe('validateRequestBody', () => {
  it('accepts valid data omitting optional properties', () => {
    validateRequestBody({title: 'work'}, aBodySpec(TODO_SCHEMA));
  });

  it('rejects data missing a required property', () => {
    verifyValidationRejectsInputWithError(
      /required property 'title'/,
      {
        description: 'missing required "title"',
      },
      aBodySpec(TODO_SCHEMA),
    );
  });

  it('rejects data containing values of a wrong type', () => {
    verifyValidationRejectsInputWithError(
      /isComplete should be boolean/,
      {
        title: 'todo with a string value of "isComplete"',
        isComplete: 'a string value',
      },
      aBodySpec(TODO_SCHEMA),
    );
  });

  it('reports all validation errors', () => {
    verifyValidationRejectsInputWithError(
      /required property 'title'.*isComplete should be boolean/,
      {
        description: 'missing title and a string value of "isComplete"',
        isComplete: 'a string value',
      },
      aBodySpec(TODO_SCHEMA),
    );
  });

  it('resolves schema references', () => {
    verifyValidationRejectsInputWithError(
      /required property/,
      {description: 'missing title'},
      aBodySpec({$ref: '#/components/schemas/Todo'}),
      {Todo: TODO_SCHEMA},
    );
  });

  it('rejects empty values when body is required', () => {
    verifyValidationRejectsInputWithError(
      /body is required/i,
      null,
      aBodySpec(TODO_SCHEMA, {required: true}),
    );
  });

  it('allows empty values when body is optional', () => {
    validateRequestBody(null, aBodySpec(TODO_SCHEMA, {required: false}));
  });

  it('rejects invalid values for number properties', () => {
    const schema: SchemasObject = {
      properties: {
        count: {type: 'number'},
      },
    };
    verifyValidationRejectsInputWithError(
      /count should be number/,
      {count: 'string value'},
      aBodySpec(schema),
    );
  });
});

// ----- HELPERS ----- /

function verifyValidationRejectsInputWithError(
  errorMatcher: Error | RegExp | string,
  body: object | null,
  spec: RequestBodyObject | undefined,
  schemas?: SchemasObject,
) {
  // workaround for Function.prototype.bind not preserving argument types
  function validateRequestBodyWithBoundArgs() {
    validateRequestBody(body, spec, schemas);
  }
  expect(validateRequestBodyWithBoundArgs).to.throw(errorMatcher);
}
