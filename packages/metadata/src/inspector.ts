// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector, NamespacedReflect} from './reflect';
import {MetadataMap} from './decorator-factory';

/**
 * TypeScript reflector without a namespace. The TypeScript compiler can be
 * configured to add design time metadata.
 *
 * See https://www.typescriptlang.org/docs/handbook/decorators.html
 */
const TSReflector = new NamespacedReflect();

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

/**
 * Options for inspection
 */
export interface InspectionOptions {
  /**
   * Only inspect own metadata of a given target. The prototype chain will not
   * be checked. The implementation uses `Reflect.getOwnMetadata()` if the flag
   * is set to `true`. Otherwise, it uses `Reflect.getMetadata()`.
   *
   * The flag is `false` by default for `MetadataInspector`.
   */
  ownMetadataOnly?: boolean;
}

/**
 * Inspector for metadata applied by decorators
 */
export class MetadataInspector {
  /**
   * Expose Reflector, which is a wrapper of `Reflect` and it uses `loopback`
   * as the namespace prefix for all metadata keys
   */
  static readonly Reflector = Reflector;
  /**
   * Expose the reflector for TypeScript design-time metadata
   */
  static readonly DesignTimeReflector = TSReflector;

  /**
   * Get the metadata associated with the given key for a given class
   * @param key Metadata key
   * @param target Class that contains the metadata
   * @param options Options for inspection
   */
  static getClassMetadata<T>(
    key: string,
    target: Function,
    options?: InspectionOptions,
  ): T | undefined {
    return options && options.ownMetadataOnly
      ? Reflector.getOwnMetadata(key, target)
      : Reflector.getMetadata(key, target);
  }

  /**
   * Define metadata for the given target
   * @param key Metadata key
   * @param value Metadata value
   * @param target Target for the metadata
   * @param member Optional property or method name
   */
  static defineMetadata<T>(
    key: string,
    value: T,
    target: Object,
    member?: string | symbol,
  ) {
    Reflector.defineMetadata(key, value, target, member);
  }

  /**
   * Get the metadata associated with the given key for all methods of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param options Options for inspection
   */
  static getAllMethodMetadata<T>(
    key: string,
    target: Object,
    options?: InspectionOptions,
  ): MetadataMap<T> | undefined {
    return options && options.ownMetadataOnly
      ? Reflector.getOwnMetadata(key, target)
      : Reflector.getMetadata(key, target);
  }

  /**
   * Get the metadata associated with the given key for a given method of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param methodName Method name. If not present, default to '' to use
   * the constructor
   * @param options Options for inspection
   */
  static getMethodMetadata<T>(
    key: string,
    target: Object,
    methodName?: string | symbol,
    options?: InspectionOptions,
  ): T | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T> =
      options && options.ownMetadataOnly
        ? Reflector.getOwnMetadata(key, target)
        : Reflector.getMetadata(key, target);
    return meta && meta[methodName];
  }

  /**
   * Get the metadata associated with the given key for all properties of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param options Options for inspection
   */
  static getAllPropertyMetadata<T>(
    key: string,
    target: Object,
    options?: InspectionOptions,
  ): MetadataMap<T> | undefined {
    return options && options.ownMetadataOnly
      ? Reflector.getOwnMetadata(key, target)
      : Reflector.getMetadata(key, target);
  }

  /**
   * Get the metadata associated with the given key for a given property of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static properties or prototype for instance
   * properties
   * @param propertyName Property name
   * @param options Options for inspection
   */
  static getPropertyMetadata<T>(
    key: string,
    target: Object,
    propertyName: string | symbol,
    options?: InspectionOptions,
  ): T | undefined {
    const meta: MetadataMap<T> =
      options && options.ownMetadataOnly
        ? Reflector.getOwnMetadata(key, target)
        : Reflector.getMetadata(key, target);
    return meta && meta[propertyName];
  }

  /**
   * Get the metadata associated with the given key for all parameters of a
   * given method
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param methodName Method name. If not present, default to '' to use
   * the constructor
   * @param options Options for inspection
   */
  static getAllParameterMetadata<T>(
    key: string,
    target: Object,
    methodName?: string | symbol,
    options?: InspectionOptions,
  ): T[] | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T[]> =
      options && options.ownMetadataOnly
        ? Reflector.getOwnMetadata(key, target)
        : Reflector.getMetadata(key, target);
    return meta && meta[methodName];
  }

  /**
   * Get the metadata associated with the given key for a parameter of a given
   * method by index
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param methodName Method name. If not present, default to '' to use
   * the constructor
   * @param index Index of the parameter, starting with 0
   * @param options Options for inspection
   */
  static getParameterMetadata<T>(
    key: string,
    target: Object,
    methodName: string | symbol,
    index: number,
    options?: InspectionOptions,
  ): T | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T[]> =
      options && options.ownMetadataOnly
        ? Reflector.getOwnMetadata(key, target)
        : Reflector.getMetadata(key, target);
    const params = meta && meta[methodName];
    return params && params[index];
  }

  /**
   * Get TypeScript design time type for a property
   * @param target Class or prototype
   * @param propertyName Property name
   */
  static getDesignTypeForProperty(
    target: Object,
    propertyName: string | symbol,
  ): Function {
    return TSReflector.getMetadata('design:type', target, propertyName);
  }

  /**
   * Get TypeScript design time type for a method
   * @param target Class or prototype
   * @param methodName Method name
   */
  static getDesignTypeForMethod(
    target: Object,
    methodName: string | symbol,
  ): DesignTimeMethodMetadata {
    const type = TSReflector.getMetadata('design:type', target, methodName);
    const parameterTypes = TSReflector.getMetadata(
      'design:paramtypes',
      target,
      methodName,
    );
    const returnType = TSReflector.getMetadata(
      'design:returntype',
      target,
      methodName,
    );
    return {
      type,
      parameterTypes,
      returnType,
    };
  }
}
