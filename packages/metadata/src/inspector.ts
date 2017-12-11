// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector, NamespacedReflect} from './reflect';
import {MetadataMap} from './decorator-factory';

const TSReflector = new NamespacedReflect();

/**
 * Design time metadata for a method
 */
export interface DesignTimeMethodMetadata {
  type: Function;
  parameterTypes: Function[];
  returnType: Function;
}

/**
 * Inspector for metadata applied by decorators
 */
export class MetadataInspector {
  /**
   * Get the metadata associated with the given key for a given class
   * @param key Metadata key
   * @param target Class that contains the metadata
   */
  static getClassMetadata<T>(key: string, target: Function): T | undefined {
    return Reflector.getMetadata(key, target);
  }

  /**
   * Get the metadata associated with the given key for all methods of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   */
  static getAllMethodMetadata<T>(
    key: string,
    target: Object,
  ): MetadataMap<T> | undefined {
    return Reflector.getMetadata(key, target);
  }

  /**
   * Get the metadata associated with the given key for a given method of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param methodName Method name. If not present, default to '' to use
   * the constructor
   */
  static getMethodMetadata<T>(
    key: string,
    target: Object,
    methodName?: string | symbol,
  ): T | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T> = Reflector.getMetadata(key, target);
    return meta && meta[methodName];
  }

  /**
   * Get the metadata associated with the given key for all properties of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   */
  static getAllPropertyMetadata<T>(
    key: string,
    target: Object,
  ): MetadataMap<T> | undefined {
    return Reflector.getMetadata(key, target);
  }

  /**
   * Get the metadata associated with the given key for a given property of the
   * target class or prototype
   * @param key Metadata key
   * @param target Class for static properties or prototype for instance
   * properties
   * @param propertyName Property name
   */
  static getPropertyMetadata<T>(
    key: string,
    target: Object,
    propertyName: string | symbol,
  ): T | undefined {
    const meta: MetadataMap<T> = Reflector.getMetadata(key, target);
    return meta && meta[propertyName];
  }

  /**
   * Get the metadata associated with the given key for all parameters of a
   * given method
   * @param key Metadata key
   * @param target Class for static methods or prototype for instance methods
   * @param methodName Method name. If not present, default to '' to use
   * the constructor
   */
  static getAllParameterMetadata<T>(
    key: string,
    target: Object,
    methodName?: string | symbol,
  ): T[] | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T[]> = Reflector.getMetadata(key, target);
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
   */
  static getParameterMetadata<T>(
    key: string,
    target: Object,
    methodName: string | symbol,
    index: number,
  ): T | undefined {
    methodName = methodName || '';
    const meta: MetadataMap<T[]> = Reflector.getMetadata(key, target);
    const params = meta && meta[methodName];
    return params && params[index];
  }

  /**
   * Get TypeScript design time type for the property
   * @param target Class or prototype
   * @param propertyName Property name
   */
  static getDesignTypeForProperty(
    target: Object,
    propertyName: string | symbol,
  ): Function {
    return TSReflector.getMetadata('design:type', target, propertyName);
  }

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
