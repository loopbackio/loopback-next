// Copyright IBM Corp. 2013,2017. All Rights Reserved.
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

export interface Server {
  config: {port: number};
  start(): Promise<void>;
}

export async function createClientForServer(server: Server): Promise<Client> {
  await server.start();
  const url = `http://127.0.0.1:${server.config.port}`;
  // TODO(bajtos) Find a way how to stop the server after all tests are done
  return supertest(url);
}
