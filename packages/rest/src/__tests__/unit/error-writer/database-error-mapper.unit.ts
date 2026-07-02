// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {HttpErrors} from '../../../index';

import {mapDatabaseErrorToHttpError} from '../../../error-writer/database-error-mapper';

describe('mapDatabaseErrorToHttpError', () => {
  const databaseErrorMappings = [
    [
      'UNIQUE_CONSTRAINT_VIOLATION',
      HttpErrors.Conflict,
      409,
      'A record with this unique value already exists.',
    ],
    [
      'LOCK_CONFLICT',
      HttpErrors.Conflict,
      409,
      'The operation could not be completed due to a concurrent lock.',
    ],
    [
      'FOREIGN_KEY_VIOLATION',
      HttpErrors.UnprocessableEntity,
      422,
      'The referenced record does not exist.',
    ],
    [
      'NOT_NULL_VIOLATION',
      HttpErrors.BadRequest,
      400,
      'A required property was missing or provided as null.',
    ],
    [
      'CHECK_CONSTRAINT_VIOLATION',
      HttpErrors.BadRequest,
      400,
      'The provided value violates a field constraint.',
    ],
    [
      'DATA_TYPE_MISMATCH',
      HttpErrors.BadRequest,
      400,
      'One or more properties contained invalid data types.',
    ],
    [
      'GENERATED_COLUMN_VIOLATION',
      HttpErrors.BadRequest,
      400,
      'Attempted to modify a read-only or computed property.',
    ],
    [
      'QUERY_TIMEOUT',
      HttpErrors.GatewayTimeout,
      504,
      'The database query execution timed out.',
    ],
    [
      'CONNECTION_FAILURE',
      HttpErrors.ServiceUnavailable,
      503,
      'Database service is temporarily unavailable.',
    ],
  ] as const;

  for (const [
    code,
    ErrorClass,
    statusCode,
    expectedMessage,
  ] of databaseErrorMappings) {
    it(`maps ${code} to HTTP ${statusCode} with standard message`, () => {
      const error = {code};

      const result = mapDatabaseErrorToHttpError(error);

      expect(result).to.be.instanceof(ErrorClass);
      expect(result).to.have.property('statusCode', statusCode);
      expect(result).to.have.property('message', expectedMessage);
    });
  }

  it('returns an unmapped error unchanged', () => {
    const error = {
      code: 'UNKNOWN_DATABASE_ERROR',
      message: 'Unknown database error',
    };

    const result = mapDatabaseErrorToHttpError(error);

    expect(result).to.equal(error);
  });

  it('returns a generic Error unchanged', () => {
    const error = new Error('Something went wrong');

    const result = mapDatabaseErrorToHttpError(error);

    expect(result).to.equal(error);
  });

  it('returns null unchanged', () => {
    expect(mapDatabaseErrorToHttpError(null)).to.equal(null);
  });

  it('returns undefined unchanged', () => {
    expect(mapDatabaseErrorToHttpError(undefined)).to.equal(undefined);
  });

  it('returns primitive values unchanged', () => {
    expect(mapDatabaseErrorToHttpError('database error')).to.equal(
      'database error',
    );

    expect(mapDatabaseErrorToHttpError(123)).to.equal(123);

    expect(mapDatabaseErrorToHttpError(false)).to.equal(false);
  });

  it('preserves the original error message', () => {
    const error = {
      code: 'UNIQUE_CONSTRAINT_VIOLATION',
      message: 'Email already exists',
    };

    const result = mapDatabaseErrorToHttpError(error);

    expect(result).to.be.instanceof(HttpErrors.Conflict);
    expect(result).to.have.property('statusCode', 409);
    expect(result).to.have.property('message', 'Email already exists');
  });

  it('handles an object without a code unchanged', () => {
    const error = {
      message: 'Some database error',
    };

    const result = mapDatabaseErrorToHttpError(error);

    expect(result).to.equal(error);
  });
});
