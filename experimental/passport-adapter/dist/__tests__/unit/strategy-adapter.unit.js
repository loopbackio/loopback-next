"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@loopback/rest");
const testlab_1 = require("@loopback/testlab");
const mock_passport_strategy_1 = require("./fixtures/mock-passport-strategy");
const __1 = require("../..");
describe('Strategy Adapter', () => {
    const mockUser = { name: 'user-name', id: 'mock-id' };
    describe('authenticate()', () => {
        it('calls the authenticate method of the strategy', async () => {
            let calledFlag = false;
            // TODO: (as suggested by @bajtos) use sinon spy
            class MyStrategy extends mock_passport_strategy_1.MockPassportStrategy {
                // override authenticate method to set calledFlag
                async authenticate(req, options) {
                    calledFlag = true;
                    await super.authenticate(req, options);
                }
            }
            const strategy = new MyStrategy();
            const adapter = new __1.StrategyAdapter(strategy, 'mock-strategy');
            const request = {};
            await adapter.authenticate(request);
            testlab_1.expect(calledFlag).to.be.true();
        });
        it('returns a promise which resolves to an object', async () => {
            const strategy = new mock_passport_strategy_1.MockPassportStrategy();
            strategy.setMockUser(mockUser);
            const adapter = new __1.StrategyAdapter(strategy, 'mock-strategy');
            const request = {};
            const user = await adapter.authenticate(request);
            testlab_1.expect(user).to.be.eql(mockUser);
        });
        it('throws Unauthorized error when authentication fails', async () => {
            const strategy = new mock_passport_strategy_1.MockPassportStrategy();
            strategy.setMockUser(mockUser);
            const adapter = new __1.StrategyAdapter(strategy, 'mock-strategy');
            const request = {};
            request.headers = { testState: 'fail' };
            let error;
            try {
                await adapter.authenticate(request);
            }
            catch (err) {
                error = err;
            }
            testlab_1.expect(error).to.be.instanceof(rest_1.HttpErrors.Unauthorized);
        });
        it('throws InternalServerError when strategy returns error', async () => {
            const strategy = new mock_passport_strategy_1.MockPassportStrategy();
            strategy.setMockUser(mockUser);
            const adapter = new __1.StrategyAdapter(strategy, 'mock-strategy');
            const request = {};
            request.headers = { testState: 'error' };
            let error;
            try {
                await adapter.authenticate(request);
            }
            catch (err) {
                error = err;
            }
            testlab_1.expect(error).to.be.instanceof(rest_1.HttpErrors.InternalServerError);
        });
    });
});
//# sourceMappingURL=strategy-adapter.unit.js.map