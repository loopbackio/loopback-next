"use strict";
// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@loopback/rest");
const passportRequestMixin = require('passport/lib/http/request');
/**
 * Adapter class to invoke passport-strategy
 *   1. provides express dependencies to the passport strategies
 *   2. provides shimming of requests for passport authentication
 *   3. provides lifecycle similar to express to the passport-strategy
 *   3. provides state methods to the strategy instance
 * see: https://github.com/jaredhanson/passport
 */
class StrategyAdapter {
    /**
     * @param strategy instance of a class which implements a passport-strategy;
     * @description http://passportjs.org/
     */
    constructor(strategy, name) {
        this.strategy = strategy;
        this.name = name;
        this.name = name;
        this.passportStrategy = strategy;
    }
    /**
     * The function to invoke the contained passport strategy.
     *     1. Create an instance of the strategy
     *     2. add success and failure state handlers
     *     3. authenticate using the strategy
     * @param request The incoming request.
     */
    authenticate(request) {
        return new Promise((resolve, reject) => {
            // mix-in passport additions like req.logIn and req.logOut
            for (const key in passportRequestMixin) {
                // tslint:disable-next-line:no-any
                request[key] = passportRequestMixin[key];
            }
            // create a prototype chain of an instance of a passport strategy
            const strategy = Object.create(this.strategy);
            // add success state handler to strategy instance
            strategy.success = function (user) {
                resolve(user);
            };
            // add failure state handler to strategy instance
            strategy.fail = function (challenge) {
                reject(new rest_1.HttpErrors.Unauthorized(challenge));
            };
            // add error state handler to strategy instance
            strategy.error = function (error) {
                reject(new rest_1.HttpErrors.InternalServerError(error));
            };
            // authenticate
            strategy.authenticate(request);
        });
    }
}
exports.StrategyAdapter = StrategyAdapter;
//# sourceMappingURL=strategy-adapter.js.map