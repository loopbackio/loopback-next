// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Convert a TypeScript class/model to a JSON Schema for users, leveraging
 * LoopBack4's decorators, metadata, and reflection system.
 *
 * @remarks
 * Modules to easily convert LoopBack4 models that have been decorated with
 * `@model` and `@property` to a matching JSON Schema Definition.
 *
 * @packageDocumentation
 */

export {JsonSchema, Model} from '@loopback/repository';
export * from './build-schema';
export * from './filter-json-schema';
export * from './keys';

/**
 * Optional: From `T` make a set of properties by key `K` become optional
 *
 * @example
 * ```ts
 * type Props = {
 *   name: string;
 *   age: number;
 *   visible: boolean;
 * };
 *
 * // Expect: { name?: string; age?: number; visible?: boolean; }
 * type Props = Optional<Props>;
 *
 * // Expect: { name: string; age?: number; visible?: boolean; }
 * type Props = Optional<Props, 'age' | 'visible'>;
 * ```
 *
 * @typeParam T - Type of the object
 * @typeParam K - Keys of the object
 */
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;
