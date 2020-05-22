"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dog = void 0;
const pkg1_1 = require("pkg1");
/**
 * Dog
 */
class Dog extends pkg1_1.Pet {
    constructor() {
        super(...arguments);
        this.kind = 'Dog';
    }
}
exports.Dog = Dog;
//# sourceMappingURL=index.js.map