"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = require("passport");
/**
 * Test fixture for a mock asynchronous passport-strategy
 */
class MockPassportStrategy extends passport_1.Strategy {
    constructor() {
        super(...arguments);
        this.name = 'mock-strategy';
    }
    setMockUser(userObj) {
        this.mockUser = userObj;
    }
    /**
     * authenticate() function similar to passport-strategy packages
     * @param req
     */
    async authenticate(req, options) {
        await this.verify(req);
    }
    /**
     * @param req
     * mock verification function; usually passed in as constructor argument for
     * passport-strategy
     *
     * For the purpose of mock tests we have this here
     * pass req.query.testState = 'fail' to mock failed authorization
     * pass req.query.testState = 'error' to mock unexpected error
     */
    async verify(request) {
        if (request.headers &&
            request.headers.testState &&
            request.headers.testState === 'fail') {
            this.returnUnauthorized('authorization failed');
            return;
        }
        else if (request.headers &&
            request.headers.testState &&
            request.headers.testState === 'error') {
            this.returnError('unexpected error');
            return;
        }
        process.nextTick(this.returnMockUser.bind(this));
    }
    returnMockUser() {
        this.success(this.mockUser);
    }
    returnUnauthorized(challenge, status) {
        this.fail(challenge, status);
    }
    returnError(err) {
        this.error(err);
    }
}
exports.MockPassportStrategy = MockPassportStrategy;
//# sourceMappingURL=mock-passport-strategy.js.map