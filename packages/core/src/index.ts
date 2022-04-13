// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The core foundation for LoopBack 4. It can also serve as the platform to
 * build large-scale Node.js applications and frameworks.
 *
 * @remarks
 * For examples of how to leverage `@loopback/core` to build composable and
 * extensible projects, check out the
 * {@link https://loopback.io/doc/en/lb4/core-tutorial.html | core tutorial}.
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
export * from './mixin-target';
export * from './server';
export * from './service';
