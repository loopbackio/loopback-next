// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A LoopBack 4 component for authentication support.
 *
 * @remarks
 * The core logic for the authentication layer in LoopBack 4.
 *
 * It contains:
 *
 *  - A decorator to express an authentication requirement on controller methods
 *  - A provider to access method-level authentication metadata
 *  - An action in the REST sequence to enforce authentication
 *  - An extension point to discover all authentication strategies and handle
 *    the delegation
 *
 * @packageDocumentation
 */

export * from './authentication.component';
export * from './decorators';
export * from './keys';
export * from './providers';
export * from './services';
export * from './types';
