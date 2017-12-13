// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector} from './reflect';
import * as _ from 'lodash';
import * as debugModule from 'debug';
const debug = debugModule('loopback:metadata:decorator');

// tslint:disable:no-any

/**
 * An object mapping keys to corresponding metadata
 */
export interface MetadataMap<T> {
  [propertyOrMethodName: string]: T;
}

/**
 * Options for a decorator
 */
export interface DecoratorOptions {
  /**
   * Inheritance will be honored
   */
  allowsInheritance?: boolean;
  [name: string]: any;
}

/**
 * Decorator function types
 */
export type DecoratorType =
  | ClassDecorator
  | PropertyDecorator
  | MethodDecorator
  | ParameterDecorator;

/**
 * Base factory class for decorator functions
 *
 * @example
 * ```
 * function classDecorator(spec: MySpec): ClassDecorator {
 *   return ClassDecoratorFactory.createDecorator('my-key', spec);
 * }
 * ```
 * or
 * ```
 * function classDecorator(spec: MySpec): ClassDecorator {
 *   const factory: ClassDecoratorFactory<MySpec>('my-key', spec);
 *   return factory.create();
 * }
 * ```
 * These functions above declare `@classDecorator` that can be used as follows:
 * ```
 * @classDecorator({x: 1})
 * class MyController {}
 * ```
 */
export class DecoratorFactory<
  T, // Type of the metadata spec for individual class/method/property/parameter
  M extends T | MetadataMap<T> | MetadataMap<T[]>, // Type of the metadata
  D extends DecoratorType // Type of the decorator
> {
  /**
   * A constant to reference the target of a decoration
   */
  static TARGET = '__decoratorTarget';

  /**
   * Construct a new class decorator factory
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator. Default to
   * `{allowInheritance: true}` if not provided
   */
  constructor(
    protected key: string,
    protected spec: T,
    protected options?: DecoratorOptions,
  ) {
    this.options = Object.assign({allowInheritance: true}, options);
  }

  protected allowInheritance(): boolean {
    return this.options && this.options.allowInheritance;
  }

  /**
   * Inherit metadata from base classes. By default, this method merges base
   * metadata into the spec if `allowInheritance` is set to `true`. To customize
   * the behavior, this method can be overridden by sub classes.
   *
   * @param baseMeta Metadata from base classes for the member
   */
  protected inherit(baseMeta: T | undefined | null): T {
    if (!this.allowInheritance()) return this.spec;
    if (baseMeta == null) return this.spec;
    if (this.spec == undefined) return baseMeta;
    if (typeof baseMeta !== 'object') return this.spec;
    if (Array.isArray(baseMeta) || Array.isArray(this.spec)) {
      // For arrays, we don't merge
      return this.spec;
    }
    return Object.assign(baseMeta, this.spec);
  }

  /**
   * Get name of a decoration target
   * @param target Class or prototype of a class
   * @param member Optional property/method name
   * @param descriptorOrIndex Optional method descriptor or parameter index
   */
  getTargetName(
    target: Object,
    member?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    let name =
      target instanceof Function
        ? target.name
        : target.constructor.name + '.prototype';
    if (member == null && descriptorOrIndex == null) {
      return 'class ' + name;
    }
    if (member == null) member = 'constructor';
    if (typeof descriptorOrIndex === 'number') {
      // Parameter
      name =
        'parameter ' +
        name +
        '.' +
        member.toString() +
        '[' +
        descriptorOrIndex +
        ']';
    } else if (descriptorOrIndex != null) {
      name = 'method ' + name + '.' + member.toString();
    } else {
      name = 'property ' + name + '.' + member.toString();
    }
    return name;
  }

  /**
   * Get the number of parameters for a given constructor or method
   * @param target Class or the prototype
   * @param member Method name
   */
  getNumberOfParameters(target: Object, member?: string | symbol) {
    if (target instanceof Function && member == null) {
      // constructor
      return target.length;
    } else {
      // target[member] is a function
      return (<any>target)[member!].length;
    }
  }

  /**
   * Set a reference to the target class or prototype for a given spec if
   * it's an object
   * @param spec Metadata spec
   * @param target Target of the decoration. It is a class or the prototype of
   * a class.
   */
  withTarget(spec: T, target: Object) {
    if (typeof spec === 'object' && spec != null) {
      const specWithTarget = spec as any;
      // Add a hidden property for the `target`
      Object.defineProperty(specWithTarget, DecoratorFactory.TARGET, {
        value: target,
        enumerable: false,
      });
    }
    return spec;
  }

  /**
   * Get the optional decoration target of a given spec
   * @param spec Metadata spec
   */
  getTarget(spec: T) {
    if (typeof spec === 'object' && spec != null) {
      const specWithTarget = spec as any;
      return specWithTarget[DecoratorFactory.TARGET];
    } else {
      return undefined;
    }
  }

  /**
   * To be overridden by subclasses to process inherited metadata
   * @param meta Metadata inherited from the base
   * @param target Decoration target
   * @param member Optional property or method
   * @param descriptorOrIndex Optional parameter index or method descriptor
   */
  protected processInherited(
    baseMeta: M,
    target: Object,
    member?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ): M {
    return baseMeta;
  }

  /**
   * To be overridden by subclasses to process local metadata
   * @param meta Metadata exists on the target
   * @param target Decoration target
   * @param member Optional property or method
   * @param descriptorOrIndex Optional parameter index or method descriptor
   */
  protected processLocal(
    localMeta: M,
    target: Object,
    member?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ): M {
    return localMeta;
  }

  /**
   * Create a decorator function of the given type. Each sub class MUST
   * implement this method.
   */
  create(): D {
    throw new Error('create() is not implemented');
  }

  /**
   * Base implementation of the decorator function
   * @param target Decorator target
   * @param member Optional property or method
   * @param descriptorOrIndex Optional method descriptor or parameter index
   */
  protected decorate(
    target: Object,
    member?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    const targetName = this.getTargetName(target, member, descriptorOrIndex);
    let meta: M = Reflector.getOwnMetadata(this.key, target);
    if (meta == null && this.allowInheritance()) {
      // Clone the base metadata so that it won't be accidentally
      // mutated by sub classes
      meta = DecoratorFactory.cloneDeep(
        Reflector.getMetadata(this.key, target),
      );
      meta = this.processInherited(meta, target, member, descriptorOrIndex);
      if (debug.enabled) {
        debug('%s: %j', targetName, meta);
      }
      Reflector.defineMetadata(this.key, meta, target);
    } else {
      meta = this.processLocal(meta, target, member, descriptorOrIndex);
      if (debug.enabled) {
        debug('%s: %j', targetName, meta);
      }
      Reflector.defineMetadata(this.key, meta, target);
    }
  }

  /**
   * Create a decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  protected static _createDecorator<
    T,
    M extends T | MetadataMap<T> | MetadataMap<T[]>,
    D extends DecoratorType
  >(key: string, spec: T, options?: DecoratorOptions): D {
    const inst = new this<T, M, D>(key, spec, options);
    return inst.create();
  }

  static cloneDeep<T>(val: T): T {
    if (val === undefined) {
      return {} as T;
    }
    return _.cloneDeepWith(val, v => {
      // Do not clone functions
      if (typeof v === 'function') return v;
      return undefined;
    });
  }
}

/**
 * Factory for class decorators
 */
export class ClassDecoratorFactory<T> extends DecoratorFactory<
  T,
  T,
  ClassDecorator
> {
  protected processInherited(
    baseMeta: T,
    target: Object,
    member?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    return this.withTarget(<T>this.inherit(baseMeta), target);
  }

  protected processLocal(
    localMeta: T,
    target: Object,
    member?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    if (localMeta != null) {
      throw new Error(
        'Decorator cannot be applied more than once on ' +
          this.getTargetName(target),
      );
    }
    return this.withTarget(this.spec, target);
  }

  create(): ClassDecorator {
    return (target: Function) => this.decorate(target);
  }

  /**
   * Create a class decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(key: string, spec: T, options?: DecoratorOptions) {
    return super._createDecorator<T, T, ClassDecorator>(key, spec, options);
  }
}

/**
 * Factory for property decorators
 */
export class PropertyDecoratorFactory<T> extends DecoratorFactory<
  T,
  MetadataMap<T>,
  PropertyDecorator
> {
  protected processInherited(
    baseMeta: MetadataMap<T>,
    target: Object,
    propertyName?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    const propertyMeta: T = this.withTarget(
      <T>this.inherit(baseMeta[propertyName!]),
      target,
    );
    baseMeta[propertyName!] = propertyMeta;
    return baseMeta;
  }

  protected processLocal(
    localMeta: MetadataMap<T>,
    target: Object,
    propertyName?: string | symbol,
    descriptorOrParameterIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    if (localMeta == null) localMeta = {};
    if (localMeta[propertyName!] != null) {
      const targetName = this.getTargetName(target, propertyName);
      throw new Error(
        'Decorator cannot be applied more than once on ' + targetName,
      );
    }
    localMeta[propertyName!] = this.withTarget(this.spec, target);
    return localMeta;
  }

  create(): PropertyDecorator {
    return (target: Object, propertyName: string | symbol) =>
      this.decorate(target, propertyName);
  }

  /**
   * Create a property decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(key: string, spec: T, options?: DecoratorOptions) {
    return super._createDecorator<T, MetadataMap<T>, PropertyDecorator>(
      key,
      spec,
      options,
    );
  }
}

/**
 * Factory for method decorators
 */
export class MethodDecoratorFactory<T> extends DecoratorFactory<
  T,
  MetadataMap<T>,
  MethodDecorator
> {
  protected processInherited(
    baseMeta: MetadataMap<T>,
    target: Object,
    methodName?: string | symbol,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    const methodMeta = this.withTarget(
      <T>this.inherit(baseMeta[methodName!]),
      target,
    );
    baseMeta[methodName!] = methodMeta;
    return baseMeta;
  }

  protected processLocal(
    localMeta: MetadataMap<T>,
    target: Object,
    methodName?: string | symbol,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    if (localMeta == null) localMeta = {};
    const methodMeta = localMeta[methodName!];
    if (this.getTarget(methodMeta) === target) {
      throw new Error(
        'Decorator cannot be applied more than once on ' +
          this.getTargetName(target, methodName, methodDescriptor),
      );
    }
    // Set the method metadata
    localMeta[methodName!] = this.withTarget(this.spec, target);
    return localMeta;
  }

  create(): MethodDecorator {
    return (
      target: Object,
      methodName: string | symbol,
      descriptor: TypedPropertyDescriptor<any>,
    ) => this.decorate(target, methodName, descriptor);
  }

  /**
   * Create a method decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(key: string, spec: T, options?: DecoratorOptions) {
    return super._createDecorator<T, MetadataMap<T>, MethodDecorator>(
      key,
      spec,
      options,
    );
  }
}

/**
 * Factory for parameter decorators
 */
export class ParameterDecoratorFactory<T> extends DecoratorFactory<
  T,
  MetadataMap<T[]>,
  ParameterDecorator
> {
  private getOrInitMetadata(
    meta: MetadataMap<T[]>,
    target: Object,
    methodName?: string | symbol,
  ) {
    const method = methodName ? methodName : '';
    let methodMeta = meta[method];
    if (methodMeta == null) {
      // Initialize the method metadata
      methodMeta = new Array(
        this.getNumberOfParameters(target, methodName),
      ).fill(undefined);
      meta[method] = methodMeta;
    }
    return methodMeta;
  }

  protected processInherited(
    baseMeta: MetadataMap<T[]>,
    target: Object,
    methodName?: string | symbol,
    parameterIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    const methodMeta = this.getOrInitMetadata(baseMeta, target, methodName);
    const index = parameterIndex as number;
    methodMeta[index] = this.withTarget(
      <T>this.inherit(methodMeta[index]),
      target,
    );
    return baseMeta;
  }

  protected processLocal(
    localMeta: MetadataMap<T[]>,
    target: Object,
    methodName?: string | symbol,
    parameterIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    if (localMeta == null) localMeta = {};
    // Find the method metadata
    const methodMeta = this.getOrInitMetadata(localMeta, target, methodName);
    const index = parameterIndex as number;
    if (this.getTarget(methodMeta[index]) === target) {
      throw new Error(
        'Decorator cannot be applied more than once on ' +
          this.getTargetName(target, methodName, parameterIndex),
      );
    }
    // Set the parameter metadata
    methodMeta[index] = this.withTarget(
      <T>this.inherit(methodMeta[index]),
      target,
    );
    return localMeta;
  }

  create(): ParameterDecorator {
    return (
      target: Object,
      methodName: string | symbol,
      parameterIndex: number,
    ) => this.decorate(target, methodName, parameterIndex);
  }

  /**
   * Create a parameter decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(key: string, spec: T, options?: DecoratorOptions) {
    return super._createDecorator<T, MetadataMap<T[]>, ParameterDecorator>(
      key,
      spec,
      options,
    );
  }
}

/**
 * Factory for method level parameter decorator. For example, the following
 * code uses `@param` to declare two parameters for `greet()`.
 * ```ts
 * class MyController {
 *   @param('name') // Parameter 0
 *   @param('msg')  // Parameter 1
 *   greet() {}
 * }
 * ```
 */
export class MethodParameterDecoratorFactory<T> extends DecoratorFactory<
  T,
  MetadataMap<T[]>,
  MethodDecorator
> {
  protected processInherited(
    baseMeta: MetadataMap<T[]>,
    target: Object,
    methodName?: string | symbol,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    return {[methodName!]: [this.spec]};
  }

  protected processLocal(
    localMeta: MetadataMap<T[]>,
    target: Object,
    methodName?: string | symbol,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    if (localMeta == null) localMeta = {};
    let params = localMeta[methodName!];
    params = [this.spec].concat(params);
    localMeta[methodName!] = params;
    return localMeta;
  }

  create(): MethodDecorator {
    return (
      target: Object,
      methodName: string | symbol,
      descriptor: TypedPropertyDescriptor<any>,
    ) => this.decorate(target, methodName, descriptor);
  }

  /**
   * Create a method decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(key: string, spec: T, options?: DecoratorOptions) {
    return super._createDecorator<T, MetadataMap<T[]>, MethodDecorator>(
      key,
      spec,
      options,
    );
  }
}
