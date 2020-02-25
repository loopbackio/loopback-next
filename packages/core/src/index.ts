// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The foundation of a LoopBack app.
 *
 * @remarks
 * For a typical example of how to create a REST server with your application,
 * see the {@link @loopback/rest#} package.
 *
 * @packageDocumentation
 */

// Re-export public Core API coming from dependencies
export * from '@loopback/context';
// Export APIs
export * from './application';
export * from './component';
export * from './extension-point';
export * from './keys';
export * from './lifecycle';
export * from './lifecycle-registry';
export * from './server';
export * from './service';
