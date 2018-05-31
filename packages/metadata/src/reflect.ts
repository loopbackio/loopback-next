// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/metadata
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import 'reflect-metadata';

/* tslint:disable:no-any */

/*
 * namespaced wrapper to handle reflect api
 */
export class NamespacedReflect {
  /**
   * @param namespace : namespace to bind this reflect context
   */
  constructor(private namespace?: string) {}

  private getMetadataKey(metadataKey: string): string {
    // prefix namespace, if provided, to the metadata key
    return this.namespace ? this.namespace + ':' + metadataKey : metadataKey;
  }

  /**
   * define metadata for a target class or it's property/method
   */
  defineMetadata(
    metadataKey: string,
    metadataValue: any,
    target: Object,
    propertyKey?: string,
  ) {
    metadataKey = this.getMetadataKey(metadataKey);
    if (propertyKey) {
      Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
    } else {
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    }
  }

  /**
   * lookup metadata from a target object and its prototype chain
   */
  getMetadata(metadataKey: string, target: Object, propertyKey?: string): any {
    metadataKey = this.getMetadataKey(metadataKey);
    if (propertyKey) {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.getMetadata(metadataKey, target);
  }

  /**
   * get own metadata for a target object or it's property/method
   */
  getOwnMetadata(
    metadataKey: string,
    target: Object,
    propertyKey?: string,
  ): any {
    metadataKey = this.getMetadataKey(metadataKey);
    if (propertyKey) {
      return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.getOwnMetadata(metadataKey, target);
  }

  /**
   * Check if the target has corresponding metadata
   * @param metadataKey Key
   * @param target Target
   * @param propertyKey Optional property key
   */
  hasMetadata(
    metadataKey: string,
    target: Object,
    propertyKey?: string,
  ): boolean {
    metadataKey = this.getMetadataKey(metadataKey);
    if (propertyKey) {
      return Reflect.hasMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.hasMetadata(metadataKey, target);
  }

  hasOwnMetadata(
    metadataKey: string,
    target: Object,
    propertyKey?: string,
  ): boolean {
    metadataKey = this.getMetadataKey(metadataKey);
    if (propertyKey) {
      return Reflect.hasOwnMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.hasOwnMetadata(metadataKey, target);
  }

  deleteMetadata(
    metadataKey: string,
    target: Object,
    propertyKey?: string,
  ): boolean {
    metadataKey = this.getMetadataKey(metadataKey);
    if (propertyKey) {
      return Reflect.deleteMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.deleteMetadata(metadataKey, target);
  }

  getMetadataKeys(target: Object, propertyKey?: string): string[] {
    let keys: string[];
    if (propertyKey) {
      keys = Reflect.getMetadataKeys(target, propertyKey);
    } else {
      keys = Reflect.getMetadataKeys(target);
    }
    const metaKeys = [];
    if (keys) {
      if (!this.namespace) return keys; // No normalization is needed
      const prefix = this.namespace + ':';
      for (const key of keys) {
        if (key.indexOf(prefix) === 0) {
          // Only add keys with the namespace prefix
          metaKeys.push(key.substr(prefix.length));
        }
      }
    }
    return metaKeys;
  }

  getOwnMetadataKeys(target: Object, propertyKey?: string): string[] {
    let keys: string[];
    if (propertyKey) {
      keys = Reflect.getOwnMetadataKeys(target, propertyKey);
    } else {
      keys = Reflect.getOwnMetadataKeys(target);
    }
    const metaKeys = [];
    if (keys) {
      if (!this.namespace) return keys; // No normalization is needed
      const prefix = this.namespace + ':';
      for (const key of keys) {
        if (key.indexOf(prefix) === 0) {
          // Only add keys with the namespace prefix
          metaKeys.push(key.substr(prefix.length));
        }
      }
    }
    return metaKeys;
  }

  decorate(
    decorators: (PropertyDecorator | MethodDecorator)[] | ClassDecorator[],
    target: Object,
    targetKey?: string,
    descriptor?: PropertyDescriptor,
  ): PropertyDescriptor | Function {
    if (targetKey) {
      return Reflect.decorate(decorators, target, targetKey, descriptor);
    } else {
      return Reflect.decorate(<ClassDecorator[]>decorators, <Function>target);
    }
  }

  /* tslint:disable-next-line:no-any */
  metadata(
    metadataKey: string,
    metadataValue: any,
  ): {
    (target: Function): void;
    (target: Object, targetKey: string): void;
  } {
    metadataKey = this.getMetadataKey(metadataKey);
    return Reflect.metadata(metadataKey, metadataValue);
  }
}

/* tslint:disable-next-line:variable-name */
export const Reflector = new NamespacedReflect('loopback');
