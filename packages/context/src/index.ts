// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Facilities to manage artifacts and their dependencies using {@link Context}
 * in your Node.js applications. It can be used independent of the LoopBack
 * framework.
 *
 * @remarks
 * This package exposes TypeScript/JavaScript APIs and decorators to register
 * artifacts, declare dependencies, and resolve artifacts by keys. The
 * {@link Context} also serves as an IoC container to support dependency
 * injection.
 * Context and Binding are the two core concepts. A context is a registry of
 * bindings and each binding represents a resolvable artifact by the key.
 *
 * - Bindings can be fulfilled by a constant, a factory function, a class, or a
 *   provider.
 * - Bindings can be grouped by tags and searched by tags.
 * - Binding scopes can be used to control how a resolved binding value is
 *   shared.
 * - Bindings can be resolved synchronously or asynchronously.
 * - Provide {@link inject | @inject} and other variants of decorators to
 *   express dependencies.
 * - Support Constructor, property, and method injections.
 * - Allow contexts to form a hierarchy to share or override bindings.
 *
 * @pakageDocumentation
 */

export * from '@loopback/metadata';
export * from './binding';
export * from './binding-config';
export * from './binding-decorator';
export * from './binding-filter';
export * from './binding-inspector';
export * from './binding-key';
export * from './binding-sorter';
export * from './context';
export * from './context-event';
export * from './context-observer';
export * from './context-subscription';
export * from './context-view';
export * from './inject';
export * from './inject-config';
export * from './interception-proxy';
export * from './interceptor';
export * from './interceptor-chain';
export * from './invocation';
export * from './json-types';
export * from './keys';
export * from './provider';
export * from './resolution-session';
export * from './resolver';
export * from './unique-id';
export * from './value-promise';
