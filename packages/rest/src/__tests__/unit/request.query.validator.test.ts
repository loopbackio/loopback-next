import {expect} from '@loopback/testlab';
import {validateRequestQuery} from '../../validation/request-query.validator';
import {RestHttpErrors} from '../../';
import {aBodySpec} from '../helpers';
import {
  ReferenceObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';

const INVALID_MSG = RestHttpErrors.INVALID_REQUEST_QUERY_MESSAGE;

const PING_SCHEMA = {
  properties: {
    pageSize: {type: 'integer', minimum: 0, maximum: 100, multipleOf: 5},
    pageNumber: {type: 'number', minimum: 10, maximum: 200, multipleOf: 3},
    pageBool: {type: 'boolean'},
    pageName: {type: 'string', maxLength: 5, minLength: 1, pattern: '[abc]+'},
  },
  required: ['pageSize'],
};

describe('validateRequestQuery', () => {
  it('accepts valid data omitting optional properties', () => {
    validateRequestQuery(
      {value: {pageSize: 5}, schema: PING_SCHEMA},
      aBodySpec(PING_SCHEMA),
    );
  });

  it('rejects data missing a required property', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '',
        code: 'required',
        message: "should have required property 'pageSize'",
        info: {missingProperty: 'pageSize'},
      },
    ];
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {
        description: 'missing required "pageSize"',
      },
      PING_SCHEMA,
    );
  });

  it('rejects data containing values of a wrong type', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '.pageBool',
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
        pageSize: 5,
        pageBool: 1111,
      },
      PING_SCHEMA,
    );
  });

  it('rejects invalid values for number properties', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '.pageNumber',
        code: 'type',
        message: 'should be number',
        info: {type: 'number'},
      },
    ];
    const schema: SchemaObject = {
      properties: {
        pageNumber: {type: 'number'},
      },
    };
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {pageNumber: 'string value'},
      schema,
    );
  });

  it('rejects invalid values for number properties', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '.pageNumber',
        code: 'type',
        message: 'should be number',
        info: {type: 'number'},
      },
    ];
    const schema: SchemaObject = {
      properties: {
        pageNumber: {type: 'number'},
      },
    };
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {pageNumber: 'string value'},
      schema,
    );
  });

  it('rejects invalid values for number properties', () => {
    const details: RestHttpErrors.ValidationErrorDetails[] = [
      {
        path: '.pageSize',
        code: 'type',
        message: 'should be number',
        info: {type: 'number'},
      },
      {
        path: '.pageNumber',
        code: 'type',
        message: 'should be number',
        info: {type: 'number'},
      },
      {
        path: '.pageBool',
        code: 'type',
        message: 'should be boolean',
        info: {type: 'boolean'},
      },
      {
        path: '.pageName',
        code: 'type',
        message: 'should be string',
        info: {type: 'string'},
      },
    ];
    const schema: SchemaObject = {
      properties: {
        pageSize: {type: 'number'},
        pageNumber: {type: 'number'},
        pageBool: {type: 'boolean'},
        pageName: {type: 'string'},
      },
    };
    verifyValidationRejectsInputWithError(
      INVALID_MSG,
      'VALIDATION_FAILED',
      details,
      {
        pageSize: 'string value',
        pageNumber: 'string value',
        pageBool: 1111,
        pageName: 123,
      },
      schema,
    );
  });
});

// ----- HELPERS ----- /

function verifyValidationRejectsInputWithError(
  expectedMessage: string,
  expectedCode: string,
  expectedDetails: RestHttpErrors.ValidationErrorDetails[] | undefined,
  query: object | null,
  schema: SchemaObject | ReferenceObject,
  schemas?: SchemasObject,
  required?: boolean,
) {
  try {
    validateRequestQuery(
      {value: query, schema},
      aBodySpec(schema, {required}),
      schemas,
    );
    throw new Error(
      "expected Function { name: 'validateRequestQuery' } to throw exception",
    );
  } catch (err) {
    expect(err.message).to.equal(expectedMessage);
    expect(err.code).to.equal(expectedCode);
    expect(err.details).to.deepEqual(expectedDetails);
  }
}
