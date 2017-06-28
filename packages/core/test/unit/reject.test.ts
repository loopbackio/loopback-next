// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ServerRequest,
  ParsedRequest,
  Reject,
  RejectProvider,
  LogError,
} from '../..';

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

  beforeEach(givenMockedResponse);

  it('returns HTTP response with status code 500 by default', async () => {
    const reject = new RejectProvider(noopLogger).value();
    reject(mock.response, mock.request, testError);
    const result = await mock.result;

    expect(result).to.have.property('statusCode', 500);
  });

  it('logs the error', async () => {
    const logger = sinon.spy() as LogError & SinonSpy;
    const reject = new RejectProvider(logger).value();

    reject(mock.response, mock.request, testError);
    const result = await mock.result;

    expect(logger).to.be.calledWith(testError, 500, mock.request);
  });

  function givenMockedResponse() {
    mock = mockResponse();
  }
});
