// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A test suite verifying functionality of `@loopback/repository` in a connector
 * -independent way.
 *
 * @remarks
 * Test-suite factories to define standardized test suite capable of testing any
 * combination of a Repository class and a corresponding connector, for example
 * DefaultCrudRepository with connectors like memory, MySQL and MongoDB.
 *
 * @packageDocumentation
 */

export * from './crud-test-suite';
export * from './types.repository-tests';

// TODO(bajtos) Implement test suite for KeyValue repository
