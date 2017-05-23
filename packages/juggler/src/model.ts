// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options, AnyType} from './common';
import {Type} from './types';

/**
 * This module defines the key classes representing building blocks for Domain
 * Driven Design.
 * See https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks
 */

/**
 * Property definition for a model
 */
export class ModelProperty {
  name: string;
  type: string | Function | Object | Type<AnyType>; // For example, 'string', String, or {}
  json?: PropertyForm;
  store?: PropertyForm;
  [attribute: string]: AnyType; // Other attributes
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
  name: string;
  properties: Map<string, ModelProperty>;
  // indexes: Map<string, AnyType>;
  [attribute: string]: AnyType; // Other attributes

  idProperties(): ModelProperty[] {
    return [];
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
    return {};
  }

  /**
   * Convert to a plain object as DTO
   */
  toObject(options?: Options): Object {
    return {};
  }

  [prop: string]: AnyType;
}

export interface Persistable {
  // isNew: boolean;
}

/**
 * Base class for value objects - An object that contains attributes but has no
 * conceptual identity. They should be treated as immutable.
 */
export abstract class ValueObject extends Model implements Persistable {
}

/**
 * Base class for entities which have unique ids
 */
export abstract class Entity extends Model implements Persistable {
  /**
   * Get the identity value. If the identity is a composite key, returns
   * an object.
   */
  getId(): AnyType {
    const definition = (this.constructor as typeof Entity).definition;
    const idProps = definition.idProperties();
    if (idProps.length === 1) {
      return this[idProps[0].name];
    }
    const idObj = {} as AnyType;
    for (const idProp of idProps) {
      idObj[idProp.name] = this[idProp.name];
    }
    return idObj;
  }

  /**
   * Get the identity as an object, such as `{id: 1}` or `{schoolId: 1, studentId: 2}`
   */
  getIdObject(): Object {
    const definition = (this.constructor as typeof Entity).definition;
    const idProps = definition.idProperties();
    const idObj = {} as AnyType;
    for (const idProp of idProps) {
      idObj[idProp.name] = this[idProp.name];
    }
    return idObj;
  }

  /**
   * Build the where object for the given id
   */
  static buildWhereForId(id: AnyType) {
    const where = {} as AnyType;
    const idProps = this.definition.idProperties();
    if (idProps.length === 1) {
      where[idProps[0].name] = id;
    }
    for (const idProp of idProps) {
      where[idProp.name] = id[idProp.name];
    }
    return where;
  }
}

/**
 * Domain events
 */
export class Event {
  source: AnyType;
  type: string;
}
