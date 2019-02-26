// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, sinon} from '@loopback/testlab';
import * as express from 'express';
import {routeHandler} from '../../rpc.router';
import {RPCServer} from '../../rpc.server';

describe('rpcRouter', () => {
  describe('routeHandler', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let server: any;
    let request: express.Request;
    let response: express.Response;
    let responseStub: sinon.SinonStub;
    beforeEach(testSetup);
    it('routes correctly when controller and method exist', async () => {
      await routeHandler(server, request, response);
      sinon.assert.called(responseStub);
      expect(responseStub.firstCall.args[0]).to.match(/Hello, Janet!/);
    });

    it('throws 400 when controller does not exist', async () => {
      const getStub = server.get as sinon.SinonStub;
      getStub.rejects(new Error('Does not exist!'));
      await routeHandler(server, request, response);
      expect(response.statusCode).to.equal(400);
      sinon.assert.called(responseStub);
      expect(responseStub.firstCall.args[0]).to.match(/Does not exist!/);
    });

    it('throws 400 when method does not exist', async () => {
      request = getRequest({
        body: {
          controller: 'FakeController',
          method: 'notReal',
          input: {
            name: 'Sad',
          },
        },
      });
      await routeHandler(server, request, response);
      expect(response.statusCode).to.equal(400);
      sinon.assert.called(responseStub);
      expect(responseStub.firstCall.args[0]).to.match(
        /No method was found on controller/,
      );
    });

    it('throws 500 on unhandled error', async () => {
      class ControllerThrowingError extends FakeController {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getFoo(input: any): string {
          throw new Error('>:(');
        }
      }
      server.get.resolves(new ControllerThrowingError());

      await routeHandler(server, request, response);

      expect(response.statusCode).to.equal(500);
      sinon.assert.called(responseStub);
      expect(responseStub.firstCall.args[0].message).to.match('>:(');
    });
    function testSetup() {
      server = getServer();
      request = getRequest();
      response = getResponse();
      responseStub = response.send as sinon.SinonStub;
    }
  });

  function getServer() {
    const server = sinon.createStubInstance(RPCServer);
    server.get.resolves(FakeController);
    return server;
  }
  function getRequest(req?: Partial<express.Request>) {
    return Object.assign(
      <express.Request>{
        body: {
          controller: 'FakeController',
          method: 'getFoo',
          input: {
            name: 'Janet',
          },
        },
      },
      req,
    );
  }

  function getResponse(res?: Partial<express.Response>) {
    const resp = <express.Response>{};
    resp.send = sinon.stub();
    return resp;
  }

  class FakeController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFoo(input: any) {
      return `Hello, ${input.name}!`;
    }
  }
});
