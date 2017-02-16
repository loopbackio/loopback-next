// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const chai = require('chai');
chai.use(require('dirty-chai'));
const expect = chai.expect;

const app = require('./');
const inspectStringwise = require('metadata').inspectStringwise;
const inspectSymbolwise = require('metadata').inspectSymbolwise;

describe('remoting metadata', () => {
  const TEST_CASES = {
    'indexed by string key': inspectStringwise,
    'indexed by Symbol key': inspectSymbolwise,
  };

  Object.keys(TEST_CASES).forEach(tc => {
    const inspect = TEST_CASES[tc];
    describe(tc, () => {
      it('recognizes app controller', () => {
        expect(inspect(app.LogController)).to.eql({
          version: '1.2.0',
          baseUrl: '/logs',
          methods: {
            getLogs: {
              http: { verb: 'get' },
              returns: { type: 'Array' },
            }
          },
        });
      });

      it('recognizes component controller', () => {
        expect(inspect(app.StatusController)).to.eql({
          version: '1.0.0',
          baseUrl: '/status',
          methods: {
            getStatus: {
               http: { verb: 'get' },
               // somehow, "design:returntype" is not defined when
               // the type is a custom/private constructor function
               // returns: { type: 'Status' },
            },
          },
        });
      });
    });
  });
});
