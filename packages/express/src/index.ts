// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The Express integration package for loopback-next.
 *
 * @remarks
 *
 * This module introduces Koa style cascading middleware that leverage
 * `async/await`. It also enables the ability to plug in existing Express
 * middleware as LoopBack middleware or interceptors so that they can be used at
 * sequence/action, global interceptor, and local interceptor tiers.
 *
 * This module also serves as a standalone extension to Express to provide
 * extensibility and composability for large-scale Express applications by
 * leveraging LoopBack's Dependency Injection and Extension Point/Extension
 * pattern.
 *
 * @packageDocumentation
 */
export * from './express.application';
export * from './express.server';
export * from './group-sorter';
export * from './keys';
export * from './middleware';
export * from './middleware-interceptor';
export * from './middleware-registry';
export * from './mixins/middleware.mixin';
export * from './providers/invoke-middleware.provider';
export * from './types';
