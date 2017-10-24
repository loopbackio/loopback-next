// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerResponse, writeResultToResponse} from '../..';

import {expect, mockResponse, ShotObservedResponse} from '@loopback/testlab';

describe('writer', () => {
  let response: ServerResponse;
  let observedResponse: Promise<ShotObservedResponse>;

  beforeEach(setupResponseMock);

  it('writes string result to response as text', async () => {
    writeResultToResponse(response, 'Joe');
    const result = await observedResponse;

    // content-type should be 'application/json' since it's set
    // into the response in writer.writeResultToResponse()
    expect(result.headers['content-type']).to.eql('text/plain');
    expect(result.payload).to.equal('Joe');
  });

  it('writes object result to response as JSON', async () => {
    writeResultToResponse(response, {name: 'Joe'});
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('application/json');
    expect(result.payload).to.equal('{"name":"Joe"}');
  });

  it('writes boolean result to response as text', async () => {
    writeResultToResponse(response, true);
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('text/plain');
    expect(result.payload).to.equal('true');
  });

  it('writes number result to response as text', async () => {
    writeResultToResponse(response, 2);
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('text/plain');
    expect(result.payload).to.equal('2');
  });

  function setupResponseMock() {
    const responseMock = mockResponse();
    response = responseMock.response;
    observedResponse = responseMock.result;

    // content-type should be undefined since it's not set in the response yet.
    expect(response.getHeader('content-type')).to.eql(undefined);
  }
});
