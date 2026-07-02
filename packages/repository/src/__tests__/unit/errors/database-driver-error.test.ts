// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {
  CheckConstraintError,
  DatabaseConnectionError,
  DatabaseError,
  DataTypeMismatchError,
  ForeignKeyConstraintError,
  LockConflictError,
  NotNullConstraintError,
  UniqueConstraintError,
} from '../../..';
import {handleRepositoryError} from '../../../errors/handle-repository-error';

describe('handleRepositoryError', () => {
  it('throws DatabaseError for a falsy error', () => {
    expect(() => handleRepositoryError(null)).to.throwError(
      new DatabaseError('An unknown database execution error occurred.'),
    );
  });

  it('passes through an existing DatabaseError', () => {
    const error = new DatabaseError('Database error');

    expect(() => handleRepositoryError(error)).to.throwError(error);
  });

  it('maps UNIQUE_CONSTRAINT_VIOLATION', () => {
    const error = givenConnectorError(
      'UNIQUE_CONSTRAINT_VIOLATION',
      'Duplicate value',
    );

    expect(() => handleRepositoryError(error)).to.throwError(
      UniqueConstraintError,
    );

    expect(() => handleRepositoryError(error)).to.throwError(/Duplicate value/);
  });

  it('maps FOREIGN_KEY_VIOLATION', () => {
    const error = givenConnectorError(
      'FOREIGN_KEY_VIOLATION',
      'Foreign key violation',
    );

    expect(() => handleRepositoryError(error)).to.throwError(
      ForeignKeyConstraintError,
    );
  });

  it('maps NOT_NULL_VIOLATION', () => {
    const error = givenConnectorError(
      'NOT_NULL_VIOLATION',
      'Not-null violation',
    );

    expect(() => handleRepositoryError(error)).to.throwError(
      NotNullConstraintError,
    );
  });

  it('maps CHECK_CONSTRAINT_VIOLATION', () => {
    const error = givenConnectorError(
      'CHECK_CONSTRAINT_VIOLATION',
      'Check constraint violation',
    );

    expect(() => handleRepositoryError(error)).to.throwError(
      CheckConstraintError,
    );
  });

  it('maps DATA_TYPE_MISMATCH', () => {
    const error = givenConnectorError(
      'DATA_TYPE_MISMATCH',
      'Data type mismatch',
    );

    expect(() => handleRepositoryError(error)).to.throwError(
      DataTypeMismatchError,
    );
  });

  it('maps LOCK_CONFLICT', () => {
    const error = givenConnectorError('LOCK_CONFLICT', 'Lock conflict');

    expect(() => handleRepositoryError(error)).to.throwError(LockConflictError);
  });

  it('maps CONNECTION_FAILURE', () => {
    const error = givenConnectorError(
      'CONNECTION_FAILURE',
      'Connection failure',
    );

    expect(() => handleRepositoryError(error)).to.throwError(
      DatabaseConnectionError,
    );
  });

  it('preserves message and details when mapping an error', () => {
    const details = {
      constraint: 'users_email_key',
      field: 'email',
    };

    const error = {
      code: 'UNIQUE_CONSTRAINT_VIOLATION',
      message: 'Email already exists',
      details,
    };

    try {
      handleRepositoryError(error);
    } catch (err) {
      expect(err).to.be.instanceof(UniqueConstraintError);
      expect((err as UniqueConstraintError).message).to.equal(
        'Email already exists',
      );
      expect((err as UniqueConstraintError).details).to.eql(details);
    }
  });

  it('rethrows an unmapped connector error as-is', () => {
    const error = {
      code: 'SOME_UNKNOWN_ERROR',
      message: 'Unknown connector error',
    };

    try {
      handleRepositoryError(error);
    } catch (err) {
      expect(err).to.equal(error);
    }
  });

  it('rethrows a generic Error as-is', () => {
    const error = new Error('Something went wrong');

    try {
      handleRepositoryError(error);
    } catch (err) {
      expect(err).to.equal(error);
    }
  });

  it('rethrows an object without a code as-is', () => {
    const error = {
      message: 'Something went wrong',
    };

    try {
      handleRepositoryError(error);
    } catch (err) {
      expect(err).to.equal(error);
    }
  });
});

function givenConnectorError(code: string, message: string) {
  return {
    code,
    message,
    details: {
      source: 'test',
    },
  };
}
