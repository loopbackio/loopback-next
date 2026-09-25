import {HttpErrors} from '../';

/**
 * Maps protocol-neutral DatabaseError instances or error objects containing
 * database code strings into standard REST HttpErrors.
 */
export function mapDatabaseErrorToHttpError(err: unknown): unknown {
  if (!err || typeof err !== 'object') {
    return err;
  }

  const errorObj = err as {code?: string; message?: string};
  const code = errorObj.code;

  switch (code) {
    // 409 Conflict
    case 'UNIQUE_CONSTRAINT_VIOLATION':
    case 'LOCK_CONFLICT':
      return new HttpErrors.Conflict(errorObj.message);

    // 422 Unprocessable Entity
    case 'FOREIGN_KEY_VIOLATION':
      return new HttpErrors.UnprocessableEntity(errorObj.message);

    // 400 Bad Request
    case 'NOT_NULL_VIOLATION':
    case 'CHECK_CONSTRAINT_VIOLATION':
    case 'DATA_TYPE_MISMATCH':
    case 'GENERATED_COLUMN_VIOLATION':
      return new HttpErrors.BadRequest(errorObj.message);

    // 504 Gateway Timeout
    case 'QUERY_TIMEOUT':
      return new HttpErrors.GatewayTimeout(errorObj.message);

    // 503 Service Unavailable
    case 'CONNECTION_FAILURE':
      return new HttpErrors.ServiceUnavailable(errorObj.message);

    default:
      return err;
  }
}
