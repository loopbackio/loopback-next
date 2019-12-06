// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import parser from 'body-parser';
import express from 'express';
import {RPCServer} from './rpc.server';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: any,
  statusCode: number,
) {
  resp.statusCode = statusCode;
  resp.send(send);
}
