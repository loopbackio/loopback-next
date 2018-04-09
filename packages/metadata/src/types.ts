// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT'

/**
 * Decorator function types
 */
export type DecoratorType =
  | ClassDecorator
  | PropertyDecorator
  | MethodDecorator
  | ParameterDecorator;

/**
 * A strongly-typed metadata accessor via reflection
 * @typeparam T Type of the metadata value
 * @typeparam D Type of the decorator
 */
export class MetadataAccessor<T, D extends DecoratorType = DecoratorType> {
  private constructor(public readonly key: string) {}

  toString() {
    return this.key;
  }

  /**
   * Create a strongly-typed metadata accessor
   * @param key The metadata key
   * @typeparam T Type of the metadata value
   * @typeparam D Type of the decorator
   */
  static create<T, D extends DecoratorType = DecoratorType>(key: string) {
    return new MetadataAccessor<T, D>(key);
  }
}

/**
 * Key for metadata access via reflection
 * @typeparam T Type of the metadata value
 * @typeparam D Type of the decorator
 */
export type MetadataKey<T, D extends DecoratorType> =
  | MetadataAccessor<T, D>
  | string;

/**
 * An object mapping keys to corresponding metadata
 */
export interface MetadataMap<T> {
  [propertyOrMethodName: string]: T;
}

/**
 * Design time metadata for a method.
 *
 * @example
 * ```ts
 * class MyController
 * {
 *   myMethod(x: string, y: number, z: MyClass): boolean {
 *     // ...
 *     return true;
 *   }
 * }
 * ```
 *
 * The `myMethod` above has design-time metadata as follows:
 * ```ts
 * {
 *   type: Function,
 *   parameterTypes: [String, Number, MyClass],
 *   returnType: Boolean
 * }
 * ```
 */
export interface DesignTimeMethodMetadata {
  /**
   * Type of the method itself. It is `Function`
   */
  type: Function;
  /**
   * An array of parameter types
   */
  parameterTypes: Function[];
  /**
   * Return type
   */
  returnType: Function;
}
