// Copyright Owner 2020,2021. All Rights Reserved.
// Node module: pkg1
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Base class for pets
 */
export class Pet {
  /**
   * Create a pet
   * @param name - Name of the pet
   * @param kind - Kind of the pet
   */
  constructor(public readonly name: string, public readonly kind: string) {}

  /**
   * Greet the pet
   * @param msg - Message for the greeting
   * @returns The description
   */
  greet(msg: string) {
    return `[${msg}] ${this.name}:${this.kind}`;
  }
}
