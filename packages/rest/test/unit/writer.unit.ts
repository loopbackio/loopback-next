// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Response, writeResultToResponse} from '../..';
import {Duplex} from 'stream';
import {expect, mockResponse, ShotObservedResponse} from '@loopback/testlab';

describe('writer', () => {
  let response: Response;
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

  it('writes boolean result to response as json', async () => {
    writeResultToResponse(response, true);
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('application/json');
    expect(result.payload).to.equal('true');
  });

  it('writes number result to response as json', async () => {
    writeResultToResponse(response, 2);
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('application/json');
    expect(result.payload).to.equal('2');
  });

  it('writes buffer result to response as binary', async () => {
    const buf = Buffer.from('ABC123');
    writeResultToResponse(response, buf);
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('application/octet-stream');
    expect(result.payload).to.equal('ABC123');
  });

  it('writes stream result to response as binary', async () => {
    const buf = Buffer.from('ABC123');
    const stream = new Duplex();
    stream.push(buf);
    stream.push(null);
    writeResultToResponse(response, stream);
    const result = await observedResponse;

    expect(result.headers['content-type']).to.eql('application/octet-stream');
    expect(result.payload).to.equal('ABC123');
  });

  function setupResponseMock() {
    const responseMock = mockResponse();
    response = responseMock.response;
    observedResponse = responseMock.result;

    // content-type should be undefined since it's not set in the response yet.
    expect(response.getHeader('content-type')).to.eql(undefined);
  }
});
