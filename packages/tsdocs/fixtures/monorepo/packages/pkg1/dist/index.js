"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for pets
 */
class Pet {
    /**
     * Create a pet
     * @param name - Name of the pet
     * @param kind - Kind of the pet
     */
    constructor(name, kind) {
        this.name = name;
        this.kind = kind;
    }
    /**
     * Greet the pet
     * @param msg - Message for the greeting
     * @returns The description
     */
    greet(msg) {
        return `[${msg}] ${this.name}:${this.kind}`;
    }
}
exports.Pet = Pet;
//# sourceMappingURL=index.js.map