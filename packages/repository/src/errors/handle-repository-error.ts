import {
  CheckConstraintError,
  DatabaseConnectionError,
  DatabaseError,
  DataTypeMismatchError,
  ForeignKeyConstraintError,
  LockConflictError,
  NotNullConstraintError,
  UniqueConstraintError,
} from './database.error';
import {EntityNotFoundError} from './entity-not-found.error';

/**
 * Normalizes or re-throws errors originating from legacy juggler or connector operations.
 */
export function handleRepositoryError(err: unknown): never {
  if (!err) {
    throw new DatabaseError('An unknown database execution error occurred.');
  }

  if (err instanceof DatabaseError) {
    throw err;
  }

  if (typeof err === 'object' && err !== null && 'code' in err) {
    const errorObj = err as {
      code?: string;
      message?: string;
      details?: Record<string, unknown>;
    };

    switch (errorObj.code) {
      case 'UNIQUE_CONSTRAINT_VIOLATION':
        throw new UniqueConstraintError(errorObj.message, errorObj.details);
      // returning entity not found error to avoid leaking db schema information
      case 'TABLE_NOT_FOUND':
        throw new EntityNotFoundError(
          errorObj.message || 'record not found',
          errorObj.details,
        );
      case 'FOREIGN_KEY_VIOLATION':
        throw new ForeignKeyConstraintError(errorObj.message, errorObj.details);
      case 'NOT_NULL_VIOLATION':
        throw new NotNullConstraintError(errorObj.message, errorObj.details);
      case 'CHECK_CONSTRAINT_VIOLATION':
        throw new CheckConstraintError(errorObj.message, errorObj.details);
      case 'DATA_TYPE_MISMATCH':
        throw new DataTypeMismatchError(errorObj.message, errorObj.details);
      case 'LOCK_CONFLICT':
        throw new LockConflictError(errorObj.message, errorObj.details);
      case 'CONNECTION_FAILURE':
        throw new DatabaseConnectionError(errorObj.message, errorObj.details);
    }
  }

  throw err;
}
