// Copyright IBM Corp. and LoopBack contributors 2017,2019. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import debugModule from 'debug';
import {DecoratorFactory} from './decorator-factory';
import {NamespacedReflect, Reflector} from './reflect';
import {
  DecoratorType,
  DesignTimeMethodMetadata,
  MetadataKey,
  MetadataMap,
} from './types';

const debug = debugModule('loopback:metadata:inspector');

/**
 * TypeScript reflector without a namespace. The TypeScript compiler can be
 * configured to add design time metadata.
 *
 * See https://www.typescriptlang.org/docs/handbook/decorators.html
 */
const TSReflector = new NamespacedReflect();

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
   * @param key - Metadata key
   * @param target - Class that contains the metadata
   * @param options - Options for inspection
   */
  static getClassMetadata<T>(
    key: MetadataKey<T, ClassDecorator>,
    target: Function,
    options?: InspectionOptions,
  ): T | undefined {
    return options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
  }

  /**
   * Define metadata for the given target
   * @param key - Metadata key
   * @param value - Metadata value
   * @param target - Target for the metadata
   * @param member - Optional property or method name
   */
  static defineMetadata<T>(
    key: MetadataKey<T, DecoratorType>,
    value: T,
    target: Object,
    member?: string,
  ) {
    Reflector.defineMetadata(key.toString(), value, target, member);
  }

  /**
   * Get the metadata associated with the given key for all methods of the
   * target class or prototype
   * @param key - Metadata key
   * @param target - Class for static methods or prototype for instance methods
   * @param options - Options for inspection
   */
  static getAllMethodMetadata<T>(
    key: MetadataKey<T, MethodDecorator>,
    target: Object,
    options?: InspectionOptions,
  ): MetadataMap<T> | undefined {
    return options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
  }

  /**
   * Get the metadata associated with the given key for a given method of the
   * target class or prototype
   * @param key - Metadata key
   * @param target - Class for static methods or prototype for instance methods
   * @param methodName - Method name. If not present, default to '' to use
   * the constructor
   * @param options - Options for inspection
   */
  static getMethodMetadata<T>(
    key: MetadataKey<T, MethodDecorator>,
    target: Object,
    methodName?: string,
    options?: InspectionOptions,
  ): T | undefined {
    methodName = methodName ?? '';
    const meta: MetadataMap<T> = options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
    return meta?.[methodName];
  }

  /**
   * Get the metadata associated with the given key for all properties of the
   * target class or prototype
   * @param key - Metadata key
   * @param target - Class for static methods or prototype for instance methods
   * @param options - Options for inspection
   */
  static getAllPropertyMetadata<T>(
    key: MetadataKey<T, PropertyDecorator>,
    target: Object,
    options?: InspectionOptions,
  ): MetadataMap<T> | undefined {
    return options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
  }

  /**
   * Get the metadata associated with the given key for a given property of the
   * target class or prototype
   * @param key - Metadata key
   * @param target - Class for static properties or prototype for instance
   * properties
   * @param propertyName - Property name
   * @param options - Options for inspection
   */
  static getPropertyMetadata<T>(
    key: MetadataKey<T, PropertyDecorator>,
    target: Object,
    propertyName: string,
    options?: InspectionOptions,
  ): T | undefined {
    const meta: MetadataMap<T> = options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
    return meta?.[propertyName];
  }

  /**
   * Get the metadata associated with the given key for all parameters of a
   * given method
   * @param key - Metadata key
   * @param target - Class for static methods or prototype for instance methods
   * @param methodName - Method name. If not present, default to '' to use
   * the constructor
   * @param options - Options for inspection
   */
  static getAllParameterMetadata<T>(
    key: MetadataKey<T, ParameterDecorator>,
    target: Object,
    methodName?: string,
    options?: InspectionOptions,
  ): T[] | undefined {
    methodName = methodName ?? '';
    const meta: MetadataMap<T[]> = options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
    return meta?.[methodName];
  }

  /**
   * Get the metadata associated with the given key for a parameter of a given
   * method by index
   * @param key - Metadata key
   * @param target - Class for static methods or prototype for instance methods
   * @param methodName - Method name. If not present, default to '' to use
   * the constructor
   * @param index - Index of the parameter, starting with 0
   * @param options - Options for inspection
   */
  static getParameterMetadata<T>(
    key: MetadataKey<T, ParameterDecorator>,
    target: Object,
    methodName: string,
    index: number,
    options?: InspectionOptions,
  ): T | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T[]> = options?.ownMetadataOnly
      ? Reflector.getOwnMetadata(key.toString(), target)
      : Reflector.getMetadata(key.toString(), target);
    const params = meta?.[methodName];
    return params?.[index];
  }

  /**
   * Get TypeScript design time type for a property
   * @param target - Class or prototype
   * @param propertyName - Property name
   * @returns Design time metadata. The return value is `undefined` when:
   * - The property has type `undefined`, `null`
   * - The TypeScript project has not enabled the compiler option `emitDecoratorMetadata`.
   * - The code is written in vanilla JavaScript.
   */
  static getDesignTypeForProperty(
    target: Object,
    propertyName: string,
  ): Function | undefined {
    return TSReflector.getMetadata('design:type', target, propertyName);
  }

  /**
   * Get TypeScript design time type for a method.
   * @param target - Class or prototype
   * @param methodName - Method name
   * @returns Design time metadata. The return value is `undefined`
   * in projects that do not enable `emitDecoratorMetadata`
   * in TypeScript compiler options or are written in vanilla JavaScript.
   */
  static getDesignTypeForMethod(
    target: Object,
    methodName: string,
  ): DesignTimeMethodMetadata | undefined {
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

    if (
      type === undefined &&
      parameterTypes === undefined &&
      returnType === undefined
    ) {
      /* istanbul ignore next */
      if (debug.enabled) {
        const targetName = DecoratorFactory.getTargetName(target, methodName);
        debug(
          'No design-time type metadata found while inspecting %s. ' +
            'Did you forget to enable TypeScript compiler option `emitDecoratorMetadata`?',
          targetName,
        );
      }

      return undefined;
    }

    return {
      type,
      parameterTypes,
      returnType,
    };
  }
}
