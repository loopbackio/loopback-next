// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authenticate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Constructor} from '..';
import 'reflect-metadata';

/**
 * Provider for the IOC container to resolve metadata information from a class
 *
 * @param namespace The namespace of the metadata eg: `loopback:controller`
 * @param metakey Field to return from the metadata. To return all fields pass 'all'
 * @param targetClass Class for resolving the metadata
 * @param propertyName Name of the class property on which metadata is resolved
 */
export class Meta {
  constructor(
    @inject('namespace') private ns: string,
    @inject('metakey') private key: string,
    @inject('class') private targetClass: Constructor<object>,
    @inject('propertyName') private propertyName?: string,
  ){}

  static key = 'meta';

  // returns metadata
  value(): string {
    const reflectHandler: ReflectHandler = new ReflectHandler(this.targetClass, this.ns);
    const meta: Map<string, string> = reflectHandler.get(this.propertyName);
    const value = meta.get(this.key);
    if (value) return value;
    return "";
  }
}

/*
 * wrapper to handle reflect api
 */
export class ReflectHandler {
  /**
   * 
   * @param targetClass : targetClass to get metadata from
   * @param ns : namespace of metadata
   */
  constructor(private targetClass: Constructor<object>, private ns: string) {}

  /**
   * get metadata from a targetclass
   * @param propertyName optional, name of target class property to get metadata from
   */
  get(propertyName?: string | symbol): Map<string, string> {
    if (propertyName)
      return Reflect.getMetadata(this.ns, this.targetClass, propertyName);
    return Reflect.getMetadata(this.ns, this.targetClass);
  }

  /**
   * define metadata for a targetclass
   * @param propertyName optional, name of target class property to define metadata
   */
  define(meta: Map<string, string>, propertyName?: string | symbol) {
    if (propertyName)
      Reflect.defineMetadata(this.ns, meta, this.targetClass, propertyName);
    return Reflect.defineMetadata(this.ns, meta, this.targetClass);
  }
}
