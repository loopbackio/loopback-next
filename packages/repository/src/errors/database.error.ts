// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Base abstract class for all database-related domain errors.
 * Protocol-neutral: Contains no HTTP status codes or transport metadata.
 */
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code = 'DATABASE_ERROR',
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class UniqueConstraintError extends DatabaseError {
  constructor(
    message = 'Unique constraint violation occurred.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'UNIQUE_CONSTRAINT_VIOLATION', details);
    this.name = 'UniqueConstraintError';
  }
}

export class ForeignKeyConstraintError extends DatabaseError {
  constructor(
    message = 'Foreign key constraint violation occurred.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'FOREIGN_KEY_VIOLATION', details);
    this.name = 'ForeignKeyConstraintError';
  }
}

export class NotNullConstraintError extends DatabaseError {
  constructor(
    message = 'Required property cannot be null or omitted.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'NOT_NULL_VIOLATION', details);
    this.name = 'NotNullConstraintError';
  }
}

export class CheckConstraintError extends DatabaseError {
  constructor(
    message = 'Check constraint or validation check failed.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'CHECK_CONSTRAINT_VIOLATION', details);
    this.name = 'CheckConstraintError';
  }
}

export class TableNotFoundError extends DatabaseError {
  constructor(
    message = 'The requested database table or relation does not exist.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'TABLE_NOT_FOUND', details);
    this.name = 'TableNotFoundError';
  }
}

export class ColumnNotFoundError extends DatabaseError {
  constructor(
    message = 'The requested database column does not exist.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'COLUMN_NOT_FOUND', details);
    this.name = 'ColumnNotFoundError';
  }
}

export class GeneratedColumnViolationError extends DatabaseError {
  constructor(
    message = 'Cannot manually assign or update values on a database-generated computed column.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'GENERATED_COLUMN_VIOLATION', details);
    this.name = 'GeneratedColumnViolationError';
  }
}

export class DataTypeMismatchError extends DatabaseError {
  constructor(
    message = 'Data type mismatch or string truncation occurred.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'DATA_TYPE_MISMATCH', details);
    this.name = 'DataTypeMismatchError';
  }
}

export class LockConflictError extends DatabaseError {
  constructor(
    message = 'Concurrency lock conflict or deadlock detected.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'LOCK_CONFLICT', details);
    this.name = 'LockConflictError';
  }
}

export class QueryTimeoutError extends DatabaseError {
  constructor(
    message = 'The database operation took too long and was aborted.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'QUERY_TIMEOUT', details);
    this.name = 'QueryTimeoutError';
  }
}

export class DbSyntaxError extends DatabaseError {
  constructor(
    message = 'A database syntax or parse error occurred.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'SYNTAX_ERROR', details);
    this.name = 'DbSyntaxError';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(
    message = 'Database service connection failed or unavailable.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'CONNECTION_FAILURE', details);
    this.name = 'DatabaseConnectionError';
  }
}
