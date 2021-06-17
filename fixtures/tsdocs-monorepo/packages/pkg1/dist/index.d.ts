// Copyright Owner 2020,2021. All Rights Reserved.
// Node module: pkg1
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Base class for pets
 */
export declare class Pet {
    readonly name: string;
    readonly kind: string;
    /**
     * Create a pet
     * @param name - Name of the pet
     * @param kind - Kind of the pet
     */
    constructor(name: string, kind: string);
    /**
     * Greet the pet
     * @param msg - Message for the greeting
     * @returns The description
     */
    greet(msg: string): string;
}
