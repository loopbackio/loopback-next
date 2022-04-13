// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A collection of test utilities we use to write LoopBack tests.
 *
 * @remarks
 * Test utilities to help write LoopBack 4 tests:
 *
 * - `expect` - behavior-driven development (BDD) style assertions
 * - `sinon`
 *   - test spies: functions recording arguments and other information for all
 *     of their calls
 *   - stubs: functions (spies) with pre-programmed behavior
 *   - mocks: fake methods (like spies) with pre-programmed behavior
 *     (like stubs) as well as pre-programmed expectations
 * - Helpers for creating `supertest` clients for LoopBack applications
 * - HTTP request/response stubs for writing tests without a listening HTTP
 *   server
 * - Swagger/OpenAPI spec validation
 *
 * @packageDocumentation
 */

export * from './client';
export * from './expect';
export * from './http-error-logger';
export * from './http-server-config';
export * from './request';
export * from './shot';
export * from './sinon';
export * from './skip';
export * from './test-sandbox';
export * from './to-json';
export * from './validate-api-spec';
