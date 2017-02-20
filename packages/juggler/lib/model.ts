/**
 * This module defines the key classes representing building blocks for Domain
 * Driven Design.
 * See https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks
 */

export abstract class Model {
  static modelName: string;

  /**
   * Serialize into a plain JSON object
   */
  abstract toJSON(): Object;

  /**
   * Convert to a plain object as DTO
   */
  abstract toObject(): Object;
};

/**
 * Base class for value objects - An object that contains attributes but has no
 * conceptual identity. They should be treated as immutable.
 */
export abstract class ValueObject {
};

/**
 * Base class for entities which have unique ids
 */
export abstract class Entity {
  /**
   * Get the identity value
   */
  abstract getId(): any;
}

/**
 * Domain events
 */
export class Event {
  source: any;
  type: string;
}
