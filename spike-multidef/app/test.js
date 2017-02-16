// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const chai = require('chai');
chai.use(require('dirty-chai'));
const expect = chai.expect;

const app = require('./');
const inspectStringwise = require('metadata').inspectStringwise;

describe('remoting metadata', () => {
  const TEST_CASES = {
    'indexed by string keys': inspectStringwise,
    // TODO: 'indexed by symbols': inspectSymbolwise
  };

  Object.keys(TEST_CASES).forEach(tc => {
    const inspect = TEST_CASES[tc];
    describe(tc, () => {
      it('recognizes app controller', () => {
        expect(inspect(app.LogController)).to.eql({
          baseUrl: '/logs',
          getLogs: { http: { verb: 'get' } }
        });
      });

      it('recognizes component controller', () => {
        expect(inspect(app.StatusController)).to.eql({
          baseUrl: '/status',
          getStatus: { http: { verb: 'get' } }
        });
      });
    });
  });
});
