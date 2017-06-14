// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options, AnyObject} from './common-types';
import {Type} from './types';

/**
 * This module defines the key classes representing building blocks for Domain
 * Driven Design.
 * See https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks
 */

// tslint:disable:no-any

export type PropertyType = string | Function | Object | Type<any>;

/**
 * Property definition for a model
 */
export class PropertyDefinition {
  readonly name: string;
  type: PropertyType; // For example, 'string', String, or {}
  json?: PropertyForm;
  store?: PropertyForm;
  [attribute: string]: any; // Other attributes

  constructor(name: string, type: PropertyType = String) {
    this.name = name;
    this.type = type;
  }
}

/**
 * See https://github.com/strongloop/loopback-datasource-juggler/issues/432
 */
export interface PropertyForm {
  in?: boolean; // Can the property be used for input
  out?: boolean; // Can the property be used for output
  name?: string; // Custom name for this form
}

/**
 * Definition for a model
 */
export class ModelDefinition {
  readonly name: string;
  properties: {[name: string]: PropertyDefinition};
  settings: {[name: string]: any};
  // indexes: Map<string, any>;
  [attribute: string]: any; // Other attributes

  constructor(
    name: string,
    properties?: {[name: string]: PropertyDefinition},
    settings?: {[name: string]: any},
  ) {
    this.name = name;
    this.properties = properties || {};
    this.settings = settings || new Map();
  }

  /**
   * Add a property
   * @param property Property definition or name (string)
   * @param type Property type
   */
  addProperty(
    property: PropertyDefinition | string,
    type?: PropertyType,
  ): this {
    if (property instanceof PropertyDefinition) {
      this.properties[property.name] = property;
    } else {
      this.properties[property] = new PropertyDefinition(property, type);
    }
    return this;
  }

  /**
   * Add a setting
   * @param name Setting name
   * @param value Setting value
   */
  addSetting(name: string, value: any): this {
    this.settings[name] = value;
    return this;
  }

  /**
   * Get an array of definitions for ID properties, which are specified in
   * the model settings or properties with `id` attribute. For example,
   * ```
   * {
   *   settings: {
   *     id: ['id']
   *   }
   *   properties: {
   *     id: {
   *       type: 'string',
   *       id: true
   *     }
   *   }
   * }
   * ```
   */
  idProperties(): PropertyDefinition[] {
    let ids: string[] | null = null;
    if (typeof this.settings.id === 'string') {
      ids = [this.settings.id];
    } else if (Array.isArray(this.settings.id)) {
      ids = this.settings.id;
    }
    if (ids) {
      return ids.map(id => this.properties[id]);
    }
    const idProps = Object.keys(this.properties)
      .map(p => this.properties[p])
      .filter(prop => prop.id);
    return idProps;
  }
}

/**
 * Base class for models
 */
export abstract class Model {
  static modelName: string;
  static definition: ModelDefinition;

  /**
   * Serialize into a plain JSON object
   */
  toJSON(): Object {
    const json: AnyObject = {};
    const def = (<typeof Model> this.constructor).definition;
    for (const p in def.properties) {
      if (p in this) {
        json[p] = this[p];
      }
    }
    return json;
  }

  /**
   * Convert to a plain object as DTO
   */
  toObject(options?: Options): Object {
    let obj: AnyObject;
    if (options && options.ignoreUnknownProperties === false) {
      obj = {};
      for (const p in this) {
        obj[p] = this[p];
      }
    } else {
      obj = this.toJSON();
    }
    return obj;
  }

  [prop: string]: any;
}

export interface Persistable {
  // isNew: boolean;
}

/**
 * Base class for value objects - An object that contains attributes but has no
 * conceptual identity. They should be treated as immutable.
 */
export abstract class ValueObject extends Model implements Persistable {}

/**
 * Base class for entities which have unique ids
 */
export abstract class Entity extends Model implements Persistable {
  /**
   * Get the identity value. If the identity is a composite key, returns
   * an object.
   */
  getId(): any {
    const definition = (this.constructor as typeof Entity).definition;
    const idProps = definition.idProperties();
    if (idProps.length === 1) {
      return this[idProps[0].name];
    }
    const idObj = {} as any;
    for (const idProp of idProps) {
      idObj[idProp.name] = this[idProp.name];
    }
    return idObj;
  }

  /**
   * Get the identity as an object, such as `{id: 1}` or
   * `{schoolId: 1, studentId: 2}`
   */
  getIdObject(): Object {
    const definition = (this.constructor as typeof Entity).definition;
    const idProps = definition.idProperties();
    const idObj = {} as any;
    for (const idProp of idProps) {
      idObj[idProp.name] = this[idProp.name];
    }
    return idObj;
  }

  /**
   * Build the where object for the given id
   */
  static buildWhereForId(id: any) {
    const where = {} as any;
    const idProps = this.definition.idProperties();
    if (idProps.length === 1) {
      where[idProps[0].name] = id;
    } else {
      for (const idProp of idProps) {
        where[idProp.name] = id[idProp.name];
      }
    }
    return where;
  }
}

/**
 * Domain events
 */
export class Event {
  source: any;
  type: string;
}
