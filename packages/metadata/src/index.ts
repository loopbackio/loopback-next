// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A package with utilities to help developers implement
 * {@link https://www.typescriptlang.org/docs/handbook/decorators.html |TypeScript decorators},
 * define/merge metadata, and inspect metadata.
 *
 * @remarks
 * Utilities:
 *
 * - Reflector: Wrapper of
 *   {@link https://github.com/rbuckton/reflect-metadata | reflect-metadata}.
 * - Decorator factories: A set of factories for class/method/property/parameter
 *   decorators to apply metadata to a given class and its static or instance
 *   members.
 * - MetadataInspector: High level APIs to inspect a class and/or its members to
 *   get metadata applied by decorators.
 *
 * @packageDocumentation
 */

export * from './decorator-factory';
export * from './inspector';
export * from './reflect';
export * from './types';
