// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';

/**
 * A replacement for `typeof Target` to be used in mixin class definitions.
 * This is a workaround for TypeScript limitation described in
 * - https://github.com/microsoft/TypeScript/issues/17293
 * - https://github.com/microsoft/TypeScript/issues/17744
 * - https://github.com/microsoft/TypeScript/issues/36060
 *
 * @example
 *
 * ```ts
 * export function MyMixin<T extends MixinTarget<Application>>(superClass: T) {
 *   return class extends superClass {
 *     // contribute new class members
 *   }
 * };
 * ```
 *
 * TypeScript does not allow class mixins to access protected members from
 * the base class. You can use the following approach as a workaround:
 *
 * ```ts
 * // eslint-disable-next-line @typescript-eslint/ban-ts-comment
 * // @ts-ignore
 * (this as unknown as {YourBaseClass}).protectedMember
 * ```
 *
 * The directive `@ts-ignore` suppresses compiler error about accessing
 * a protected member from outside. Unfortunately, it also disables other
 * compile-time checks (e.g. to verify that a protected method was invoked
 * with correct arguments, and so on). This is the same behavior you
 * would get by using `Constructor<any>` instead of `MixinTarget<Application>`.
 * The major improvement is that TypeScript can still infer the return
 * type of the protected member, therefore `any` is NOT introduced to subsequent
 * code.
 *
 * TypeScript also does not allow mixin class to overwrite a method inherited
 * from a mapped type, see https://github.com/microsoft/TypeScript/issues/38496
 * As a workaround, use `@ts-ignore` to disable the error.
 *
 * ```ts
 * export function RepositoryMixin<T extends MixinTarget<Application>>(
 * superClass: T,
 * ) {
 *   return class extends superClass {
 *    // @ts-ignore
 *    public component<C extends Component = Component>(
 *      componentCtor: Constructor<C>,
 *      nameOrOptions?: string | BindingFromClassOptions,
 *    ) {
 *      const binding = super.component(componentCtor, nameOrOptions);
 *      // ...
 *      return binding;
 *    }
 * }
 * ```
 */
export type MixinTarget<T extends object> = Constructor<{
  // Enumerate only public members to avoid the following compiler error:
  //   Property '(name)' of exported class expression
  //   may not be private or protected.ts(4094)
  [P in keyof T]: T[P];
}>;
