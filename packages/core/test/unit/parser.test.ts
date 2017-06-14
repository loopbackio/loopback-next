// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  parseOperationArgs,
  ServerRequest,
  ParsedRequest,
  parseRequestUrl,
} from '../..';
import {expect, ShotRequest, ShotRequestOptions} from '@loopback/testlab';
import {OperationObject, ParameterObject} from '@loopback/openapi-spec';

describe('operationArgsParser', () => {
  it('parses path parameters', async () => {
    const spec = givenOperationWithParameters([
      {
        name: 'id',
        type: 'number',
        in: 'path',
      },
    ]);
    const req = givenRequest();

    const args = await parseOperationArgs(req, spec, {id: 1});

    expect(args).to.eql([1]);
  });

  it('parsed body parameter', async () => {
    const spec = givenOperationWithParameters([
      {
        name: 'data',
        type: 'object',
        in: 'body',
      },
    ]);

    const req = givenRequest({
      url: '/',
      payload: {key: 'value'},
    });

    const args = await parseOperationArgs(req, spec, {});

    expect(args).to.eql([{key: 'value'}]);
  });

  function givenOperationWithParameters(params?: ParameterObject[]) {
    return <OperationObject> {
      'x-operation-name': 'testOp',
      parameters: params,
      responses: {},
    };
  }

  function givenRequest(options?: ShotRequestOptions): ParsedRequest {
    return parseRequestUrl(new ShotRequest(options || {url: '/'}));
  }
});
