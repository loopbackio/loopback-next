// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector} from './reflect';
import * as _ from 'lodash';
import * as debugModule from 'debug';
import {MetadataMap, DecoratorType, MetadataKey} from './types';
const debug = debugModule('loopback:metadata:decorator');

// tslint:disable:no-any
/**
 * Options for a decorator
 */
export interface DecoratorOptions {
  /**
   * Controls if inherited metadata will be honored. Default to `true`.
   */
  allowInheritance?: boolean;
  /**
   * Controls if the value of `spec` argument will be cloned. Sometimes we
   * use shared spec for the decoration, but the decorator function might need
   * to mutate the object. Cloning the input spec makes it safe to use the same
   * spec (`template`) to decorate different members.
   *
   * Default to `true`.
   */
  cloneInputSpec?: boolean;
  [name: string]: any;
}

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
    this.options = Object.assign(
      {allowInheritance: true, cloneInputSpec: true},
      options,
    );
    if (this.options.cloneInputSpec) {
      this.spec = DecoratorFactory.cloneDeep(spec);
    }
  }

  protected allowInheritance(): boolean {
    return !!(this.options && this.options.allowInheritance);
  }

  /**
   * Inherit metadata from base classes. By default, this method merges base
   * metadata into the spec if `allowInheritance` is set to `true`. To customize
   * the behavior, this method can be overridden by sub classes.
   *
   * @param inheritedMetadata Metadata from base classes for the member
   */
  protected inherit(inheritedMetadata: T | undefined | null): T {
    if (!this.allowInheritance()) return this.spec;
    if (inheritedMetadata == null) return this.spec;
    if (this.spec == undefined) return inheritedMetadata;
    if (typeof inheritedMetadata !== 'object') return this.spec;
    if (Array.isArray(inheritedMetadata) || Array.isArray(this.spec)) {
      // For arrays, we don't merge
      return this.spec;
    }
    return Object.assign(inheritedMetadata, this.spec);
  }

  /**
   * Get the qualified name of a decoration target. For example:
   * ```
   * class MyClass
   * MyClass.constructor[0] // First parameter of the constructor
   * MyClass.myStaticProperty
   * MyClass.myStaticMethod()
   * MyClass.myStaticMethod[0] // First parameter of the myStaticMethod
   * MyClass.prototype.myProperty
   * MyClass.prototype.myMethod()
   * MyClass.prototype.myMethod[1] // Second parameter of myMethod
   * ```
   * @param target Class or prototype of a class
   * @param member Optional property/method name
   * @param descriptorOrIndex Optional method descriptor or parameter index
   */
  static getTargetName(
    target: Object,
    member?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    let name =
      target instanceof Function
        ? target.name
        : `${target.constructor.name}.prototype`;
    if (member == null && descriptorOrIndex == null) {
      return `class ${name}`;
    }
    if (member == null) member = 'constructor';
    if (typeof descriptorOrIndex === 'number') {
      // Parameter
      name = `${name}.${member}[${descriptorOrIndex}]`;
    } else if (descriptorOrIndex != null) {
      name = `${name}.${member}()`;
    } else {
      name = `${name}.${member}`;
    }
    return name;
  }

  /**
   * Get the number of parameters for a given constructor or method
   * @param target Class or the prototype
   * @param member Method name
   */
  static getNumberOfParameters(target: Object, member?: string) {
    if (target instanceof Function && !member) {
      // constructor
      return target.length;
    } else {
      // target[member] is a function
      return (<{[methodName: string]: Function}>target)[member!].length;
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
      // Add a hidden property for the `target`
      Object.defineProperty(spec, DecoratorFactory.TARGET, {
        value: target,
        enumerable: false,
        // Make sure it won't be redefined on the same object
        configurable: false,
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
      const specWithTarget = spec as {[name: string]: any};
      return specWithTarget[DecoratorFactory.TARGET];
    } else {
      return undefined;
    }
  }

  /**
   * This method is called by the default implementation of the decorator
   * function to merge the spec argument from the decoration with the inherited
   * metadata for a class, all properties, all methods, or all method
   * parameters that are decorated by this decorator.
   *
   * It MUST be overridden by subclasses to process inherited metadata.
   *
   * @param inheritedMetadata Metadata inherited from the base classes
   * @param target Decoration target
   * @param member Optional property or method
   * @param descriptorOrIndex Optional parameter index or method descriptor
   */
  protected mergeWithInherited(
    inheritedMetadata: M,
    target: Object,
    member?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ): M {
    throw new Error('mergeWithInherited() is not implemented');
  }

  /**
   * This method is called by the default implementation of the decorator
   * function to merge the spec argument from the decoration with the own
   * metadata for a class, all properties, all methods, or all method
   * parameters that are decorated by this decorator.
   *
   * It MUST be overridden by subclasses to process own metadata.
   *
   * @param ownMetadata Own Metadata exists locally on the target
   * @param target Decoration target
   * @param member Optional property or method
   * @param descriptorOrIndex Optional parameter index or method descriptor
   */
  protected mergeWithOwn(
    ownMetadata: M,
    target: Object,
    member?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ): M {
    throw new Error('mergeWithOwn() is not implemented');
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
    member?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    const targetName = DecoratorFactory.getTargetName(
      target,
      member,
      descriptorOrIndex,
    );
    let meta: M = Reflector.getOwnMetadata(this.key, target);
    if (meta == null && this.allowInheritance()) {
      // Clone the base metadata so that it won't be accidentally
      // mutated by sub classes
      meta = DecoratorFactory.cloneDeep(
        Reflector.getMetadata(this.key, target),
      );
      meta = this.mergeWithInherited(meta, target, member, descriptorOrIndex);
      /* istanbul ignore if  */
      if (debug.enabled) {
        debug('%s: %j', targetName, meta);
      }
      Reflector.defineMetadata(this.key, meta, target);
    } else {
      meta = this.mergeWithOwn(meta, target, member, descriptorOrIndex);
      /* istanbul ignore if  */
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
  >(key: MetadataKey<T, D>, spec: T, options?: DecoratorOptions): D {
    const inst = new this<T, M, D>(key.toString(), spec, options);
    return inst.create();
  }

  // See https://github.com/lodash/lodash/blob/master/.internal/baseClone.js
  private static _cloneableTypes = [
    Object,
    Array,
    Set,
    Map,
    RegExp,
    Date,
    Buffer,
    ArrayBuffer,
    Float32Array,
    Float64Array,
    Int8Array,
    Int16Array,
    Int32Array,
    Uint8Array,
    Uint8ClampedArray,
    Uint16Array,
    Uint32Array,
  ];

  static cloneDeep<V>(val: Readonly<V>): V {
    if (typeof val !== 'object') return val;
    return _.cloneDeepWith(val, v => {
      if (typeof v !== 'object') return v;
      if (v == null) return v;
      if (
        v.constructor != null &&
        !DecoratorFactory._cloneableTypes.includes(v.constructor)
      ) {
        // Do not clone instances of classes/constructors, such as Date
        return v;
      }
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
  protected mergeWithInherited(
    inheritedMetadata: T,
    target: Object,
    member?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    return this.withTarget(<T>this.inherit(inheritedMetadata), target);
  }

  protected mergeWithOwn(
    ownMetadata: T,
    target: Object,
    member?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    if (ownMetadata != null) {
      throw new Error(
        'Decorator cannot be applied more than once on ' +
          DecoratorFactory.getTargetName(target),
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
  static createDecorator<T>(
    key: MetadataKey<T, ClassDecorator>,
    spec: T,
    options?: DecoratorOptions,
  ) {
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
  protected mergeWithInherited(
    inheritedMetadata: MetadataMap<T>,
    target: Object,
    propertyName?: string,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    inheritedMetadata = inheritedMetadata || {};
    const propertyMeta: T = this.withTarget(
      <T>this.inherit(inheritedMetadata[propertyName!]),
      target,
    );
    inheritedMetadata[propertyName!] = propertyMeta;
    return inheritedMetadata;
  }

  protected mergeWithOwn(
    ownMetadata: MetadataMap<T>,
    target: Object,
    propertyName?: string,
    descriptorOrParameterIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    ownMetadata = ownMetadata || {};
    if (ownMetadata[propertyName!] != null) {
      const targetName = DecoratorFactory.getTargetName(target, propertyName);
      throw new Error(
        'Decorator cannot be applied more than once on ' + targetName,
      );
    }
    ownMetadata[propertyName!] = this.withTarget(this.spec, target);
    return ownMetadata;
  }

  create(): PropertyDecorator {
    return (target: Object, propertyName: string) =>
      this.decorate(target, propertyName);
  }

  /**
   * Create a property decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(
    key: MetadataKey<T, PropertyDecorator>,
    spec: T,
    options?: DecoratorOptions,
  ) {
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
  protected mergeWithInherited(
    inheritedMetadata: MetadataMap<T>,
    target: Object,
    methodName?: string,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    inheritedMetadata = inheritedMetadata || {};
    const methodMeta = this.withTarget(
      <T>this.inherit(inheritedMetadata[methodName!]),
      target,
    );
    inheritedMetadata[methodName!] = methodMeta;
    return inheritedMetadata;
  }

  protected mergeWithOwn(
    ownMetadata: MetadataMap<T>,
    target: Object,
    methodName?: string,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    ownMetadata = ownMetadata || {};
    const methodMeta = ownMetadata[methodName!];
    if (this.getTarget(methodMeta) === target) {
      throw new Error(
        'Decorator cannot be applied more than once on ' +
          DecoratorFactory.getTargetName(target, methodName, methodDescriptor),
      );
    }
    // Set the method metadata
    ownMetadata[methodName!] = this.withTarget(this.spec, target);
    return ownMetadata;
  }

  create(): MethodDecorator {
    return (
      target: Object,
      methodName: string,
      descriptor: TypedPropertyDescriptor<any>,
    ) => this.decorate(target, methodName, descriptor);
  }

  /**
   * Create a method decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(
    key: MetadataKey<T, MethodDecorator>,
    spec: T,
    options?: DecoratorOptions,
  ) {
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
    methodName?: string,
  ) {
    const method = methodName ? methodName : '';
    let methodMeta = meta[method];
    if (methodMeta == null) {
      // Initialize the method metadata
      methodMeta = new Array(
        DecoratorFactory.getNumberOfParameters(target, methodName),
      ).fill(undefined);
      meta[method] = methodMeta;
    }
    return methodMeta;
  }

  protected mergeWithInherited(
    inheritedMetadata: MetadataMap<T[]>,
    target: Object,
    methodName?: string,
    parameterIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    inheritedMetadata = inheritedMetadata || {};
    const methodMeta = this.getOrInitMetadata(
      inheritedMetadata,
      target,
      methodName,
    );
    const index = parameterIndex as number;
    methodMeta[index] = this.withTarget(
      <T>this.inherit(methodMeta[index]),
      target,
    );
    return inheritedMetadata;
  }

  protected mergeWithOwn(
    ownMetadata: MetadataMap<T[]>,
    target: Object,
    methodName?: string,
    parameterIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    ownMetadata = ownMetadata || {};
    // Find the method metadata
    const methodMeta = this.getOrInitMetadata(ownMetadata, target, methodName);
    const index = parameterIndex as number;
    if (this.getTarget(methodMeta[index]) === target) {
      throw new Error(
        'Decorator cannot be applied more than once on ' +
          DecoratorFactory.getTargetName(target, methodName, parameterIndex),
      );
    }
    // Set the parameter metadata
    methodMeta[index] = this.withTarget(
      <T>this.inherit(methodMeta[index]),
      target,
    );
    return ownMetadata;
  }

  create(): ParameterDecorator {
    return (target: Object, methodName: string, parameterIndex: number) =>
      this.decorate(target, methodName, parameterIndex);
  }

  /**
   * Create a parameter decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(
    key: MetadataKey<T, ParameterDecorator>,
    spec: T,
    options?: DecoratorOptions,
  ) {
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
  /**
   * Find the corresponding parameter index for the decoration
   * @param target
   * @param methodName
   * @param methodDescriptor
   */
  private getParameterIndex(
    target: Object,
    methodName?: string,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    const numOfParams = DecoratorFactory.getNumberOfParameters(
      target,
      methodName,
    );
    // Fetch the cached parameter index
    let index = Reflector.getOwnMetadata(
      `${this.key}:index`,
      target,
      methodName,
    );
    // Default to the last parameter
    if (index == null) index = numOfParams - 1;
    if (index < 0) {
      // Excessive decorations than the number of parameters detected
      const method = DecoratorFactory.getTargetName(
        target,
        methodName,
        methodDescriptor,
      );
      throw new Error(
        `The decorator is used more than ${numOfParams} time(s) on ${method}`,
      );
    }
    return index;
  }

  protected mergeWithInherited(
    inheritedMetadata: MetadataMap<T[]>,
    target: Object,
    methodName?: string,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    inheritedMetadata = inheritedMetadata || {};
    const index = this.getParameterIndex(target, methodName, methodDescriptor);

    const inheritedParams =
      inheritedMetadata[methodName!] || new Array(index + 1).fill(undefined);
    if (inheritedParams.length) {
      // First time applied to a method. This is the last parameter of the method
      inheritedParams[index] = this.withTarget(
        <T>this.inherit(inheritedParams[index]),
        target,
      );
    }
    // Cache the index to help us position the next parameter
    Reflector.defineMetadata(
      `${this.key}:index`,
      index - 1,
      target,
      methodName,
    );
    inheritedMetadata[methodName!] = inheritedParams;
    return inheritedMetadata;
  }

  protected mergeWithOwn(
    ownMetadata: MetadataMap<T[]>,
    target: Object,
    methodName?: string,
    methodDescriptor?: TypedPropertyDescriptor<any> | number,
  ) {
    ownMetadata = ownMetadata || {};
    const index = this.getParameterIndex(target, methodName, methodDescriptor);

    let params =
      ownMetadata[methodName!] || new Array(index + 1).fill(undefined);
    params[index] = this.withTarget(<T>this.inherit(params[index]), target);
    ownMetadata[methodName!] = params;
    // Cache the index to help us position the next parameter
    Reflector.defineMetadata(
      `${this.key}:index`,
      index - 1,
      target,
      methodName,
    );
    return ownMetadata;
  }

  create(): MethodDecorator {
    return (
      target: Object,
      methodName: string,
      descriptor: TypedPropertyDescriptor<any>,
    ) => this.decorate(target, methodName, descriptor);
  }

  /**
   * Create a method decorator function
   * @param key Metadata key
   * @param spec Metadata object from the decorator function
   * @param options Options for the decorator
   */
  static createDecorator<T>(
    key: MetadataKey<T, MethodDecorator>,
    spec: T,
    options?: DecoratorOptions,
  ) {
    return super._createDecorator<T, MetadataMap<T[]>, MethodDecorator>(
      key,
      spec,
      options,
    );
  }
}
