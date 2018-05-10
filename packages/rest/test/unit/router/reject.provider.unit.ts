// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  RejectProvider,
  LogError,
  ParsedRequest,
  HandlerContext,
} from '../../..';

import {
  expect,
  mockResponse,
  ShotResponseMock,
  sinon,
  SinonSpy,
} from '@loopback/testlab';

describe('reject', () => {
  const noopLogger: LogError = () => {};
  const testError = new Error('test error');
  let mock: ShotResponseMock;
  let mockedContext: HandlerContext;

  beforeEach(givenMockedResponse);

  it('returns HTTP response with status code 500 by default', async () => {
    const reject = new RejectProvider(noopLogger).value();

    reject(mockedContext, testError);
    const result = await mock.result;

    expect(result).to.have.property('statusCode', 500);
  });

  it('logs the error', async () => {
    const logger = sinon.spy() as LogError & SinonSpy;
    const reject = new RejectProvider(logger).value();

    reject(mockedContext, testError);
    await mock.result;

    sinon.assert.calledWith(logger, testError, 500, mock.request);
  });

  function givenMockedResponse() {
    mock = mockResponse();
    mockedContext = {
      // FIXME(bajtos) Remove this explicit cast once we switch to Express
      request: mock.request as ParsedRequest,
      response: mock.response,
    };
  }
});
