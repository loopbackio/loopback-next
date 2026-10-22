import {
  UniqueConstraintError,
  LockConflictError,
  ForeignKeyConstraintError,
  NotNullConstraintError,
  CheckConstraintError,
  DataTypeMismatchError,
  DatabaseConnectionError,
} from '@loopback/repository';
import {HttpErrors} from '../';

export interface DatabaseErrorMappingOptions {
  /**
   * Whether to map database domain errors to HTTP errors.
   * @defaultValue true
   */
  enabled?: boolean;
}

export function mapDatabaseErrorToHttpError(
  err: unknown,
  options: DatabaseErrorMappingOptions = {enabled: true},
): unknown {
  if (!err || typeof err !== 'object' || options.enabled === false) {
    return err;
  }

  const errorObj = err as {code?: string; message?: string};
  const code = errorObj.code;
  const getMessage = (defaultMessage: string) => {
    return errorObj.message || defaultMessage;
  };

  if (
    err instanceof UniqueConstraintError ||
    code === 'UNIQUE_CONSTRAINT_VIOLATION'
  ) {
    return new HttpErrors.Conflict(
      getMessage('A record with this unique value already exists.'),
    );
  }

  if (err instanceof LockConflictError || code === 'LOCK_CONFLICT') {
    return new HttpErrors.Conflict(
      getMessage(
        'The operation could not be completed due to a concurrent lock.',
      ),
    );
  }

  if (
    err instanceof ForeignKeyConstraintError ||
    code === 'FOREIGN_KEY_VIOLATION'
  ) {
    return new HttpErrors.UnprocessableEntity(
      getMessage('The referenced record does not exist.'),
    );
  }

  if (err instanceof NotNullConstraintError || code === 'NOT_NULL_VIOLATION') {
    return new HttpErrors.BadRequest(
      getMessage('A required property was missing or provided as null.'),
    );
  }

  if (
    err instanceof CheckConstraintError ||
    code === 'CHECK_CONSTRAINT_VIOLATION'
  ) {
    return new HttpErrors.BadRequest(
      getMessage('The provided value violates a field constraint.'),
    );
  }

  if (err instanceof DataTypeMismatchError || code === 'DATA_TYPE_MISMATCH') {
    return new HttpErrors.BadRequest(
      getMessage('One or more properties contained invalid data types.'),
    );
  }

  if (code === 'GENERATED_COLUMN_VIOLATION') {
    return new HttpErrors.BadRequest(
      getMessage('Attempted to modify a read-only or computed property.'),
    );
  }

  if (code === 'QUERY_TIMEOUT') {
    return new HttpErrors.GatewayTimeout(
      getMessage('The database query execution timed out.'),
    );
  }

  if (err instanceof DatabaseConnectionError || code === 'CONNECTION_FAILURE') {
    return new HttpErrors.ServiceUnavailable(
      getMessage('Database service is temporarily unavailable.'),
    );
  }

  return err;
}
