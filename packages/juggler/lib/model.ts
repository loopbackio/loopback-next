/**
 * This module defines the key classes representing building blocks for Domain
 * Driven Design.
 * See https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks
 */
export class ModelProperty {
  name: string;
  type: string | Function | Object;
  readOnly?: boolean;  // Is the property only for read, such as 'lastModified'
  writeOnly?: boolean; // Is the property only for write, such as 'password'
  persistent?: boolean; // Is the property persistent?
  [attribute: string]: any; // Other attributes
}

export class ModelDefinition {
  name: string;
  properties: Map<string, ModelProperty>;
  [attribute: string]: any; // Other attributes

  idProperties(): ModelProperty[] {
    return [];
  }
}

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
  toObject(options?: Object): Object {
    return {};
  }
}

/**
 * Base class for value objects - An object that contains attributes but has no
 * conceptual identity. They should be treated as immutable.
 */
export abstract class ValueObject extends Model {
}

/**
 * Base class for entities which have unique ids
 */
export abstract class Entity extends Model {
  /**
   * Get the identity value
   */
  getId(): any {
    let definition = (this.constructor as typeof Entity).definition;
    let idProps = definition.idProperties();
    if (idProps.length === 0) {
      return this[idProps[0].name];
    }
    let idObj = {};
    for (let idProp of idProps) {
      idObj[idProp.name] = this[idProp.name];
    }
    return idObj;
  }
}

/**
 * Domain events
 */
export class Event {
  source: any;
  type: string;
}
