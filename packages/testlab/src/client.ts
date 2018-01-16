// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP client utilities
 */

import * as http from 'http';
import supertest = require('supertest');

export {supertest};

export type Client = supertest.SuperTest<supertest.Test>;

/**
 * Create a SuperTest client connected to an HTTP server listening
 * on an ephemeral port and calling `handler` to handle incoming requests.
 * @param handler
 */
export function createClientForHandler(
  handler: (req: http.ServerRequest, res: http.ServerResponse) => void,
): Client {
  const server = http.createServer(handler);
  return supertest(server);
}

export async function createClientForRestServer(
  server: RestServer,
): Promise<Client> {
  await server.start();
  const port =
    server.options && server.options.http ? server.options.http.port : 3000;
  const url = `http://127.0.0.1:${port}`;
  // TODO(bajtos) Find a way how to stop the server after all tests are done
  return supertest(url);
}

// These interfaces are meant to partially mirror the formats provided
// in our other libraries to avoid circular imports.
export interface RestServer {
  start(): Promise<void>;
  options?: {
    // tslint:disable-next-line:no-any
    [prop: string]: any;
  };
}
