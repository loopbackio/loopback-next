// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import grpc from 'grpc';
import {ServerProvider} from '../../..';

describe('ServerProvider', () => {
  it('returns a grpc singleton server', () => {
    const server: grpc.Server = new ServerProvider().value();
    expect(server).to.be.an.Object();
    expect(server.bind).to.be.a.Function();
    expect(server.start).to.be.a.Function();
    expect(server.addProtoService).to.be.a.Function();
  });
});
