// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Local transaction
 */
export interface Transaction {
  /**
   * Commit the transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<void>;

  /**
   * The transaction Identifier
   */
  id: string;
}

/**
 * Isolation level
 */
export enum IsolationLevel {
  READ_COMMITTED = 'READ COMMITTED', // default
  READ_UNCOMMITTED = 'READ UNCOMMITTED',
  SERIALIZABLE = 'SERIALIZABLE',
  REPEATABLE_READ = 'REPEATABLE READ',
}
