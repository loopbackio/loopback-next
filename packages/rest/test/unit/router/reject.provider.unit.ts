// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ExpressContextStub,
  SinonSpy,
  expect,
  sinon,
  stubExpressContext,
} from '@loopback/testlab';
import {LogError, RejectProvider} from '../../..';

describe('reject', () => {
  const noopLogger: LogError = () => {};
  const testError = new Error('test error');
  let contextStub: ExpressContextStub;

  beforeEach(givenStubbedContext);

  it('returns HTTP response with status code 500 by default', async () => {
    const reject = new RejectProvider(noopLogger).value();

    reject(contextStub, testError);
    const result = await contextStub.result;

    expect(result).to.have.property('statusCode', 500);
  });

  it('converts error code ENTITY_NOT_FOUND to status code 404', async () => {
    const reject = new RejectProvider(noopLogger).value();

    const notFoundError: Error & {code?: string} = new Error('not found');
    notFoundError.code = 'ENTITY_NOT_FOUND';

    reject(contextStub, notFoundError);
    const result = await contextStub.result;

    expect(result.statusCode).to.equal(404);
  });

  it('logs the error', async () => {
    const logger = sinon.spy() as LogError & SinonSpy;
    const reject = new RejectProvider(logger).value();

    reject(contextStub, testError);
    await contextStub.result;

    sinon.assert.calledWith(logger, testError, 500, contextStub.request);
  });

  function givenStubbedContext() {
    contextStub = stubExpressContext();
  }
});
