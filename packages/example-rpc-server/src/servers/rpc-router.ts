// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RPCServer} from './rpc-server';
import * as express from 'express';
import * as parser from 'body-parser';

export function rpcRouter(server: RPCServer) {
  const jsonParser = parser.json();
  server.expressServer.post('*', jsonParser, async (request, response) => {
    await routeHandler(server, request, response);
  });
}

export async function routeHandler(
  server: RPCServer,
  request: express.Request,
  response: express.Response,
) {
  const ctrl = request.body.controller;
  const method = request.body.method;
  const input = request.body.input;
  let controller: Controller;
  try {
    controller = await server.get<Controller>(`controllers.${ctrl}`);
    if (!controller[method]) {
      throw new Error(
        `No method was found on controller "${ctrl}" with name "${method}".`,
      );
    }
  } catch (err) {
    sendErrResponse(response, err, 400);
    return;
  }
  try {
    response.send(await controller[method](input));
  } catch (err) {
    sendErrResponse(response, err, 500);
  }
}

export type Controller = {
  [method: string]: Function;
};

function sendErrResponse(
  resp: express.Response,
  // tslint:disable-next-line:no-any
  send: any,
  statusCode: number,
) {
  resp.statusCode = statusCode;
  resp.send(send);
}
