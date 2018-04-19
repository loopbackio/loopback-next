// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP client utilities
 */

import {IncomingMessage, ServerResponse} from 'http';
import supertest = require('supertest');

export {supertest};

export type Client = supertest.SuperTest<supertest.Test>;

/**
 * Create a SuperTest client connected to an HTTP server listening
 * on an ephemeral port and calling `handler` to handle incoming requests.
 * @param handler
 */
export function createClientForHandler(
  handler: ((req: IncomingMessage, res: ServerResponse) => void),
): Client {
  return supertest(handler);
}

export async function createClientForRestServer(
  server: RestServer,
): Promise<Client> {
  await server.start();
  // TODO(bajtos) Find a way how to stop the server after all tests are done
  return supertest(server.endpoint.url);
}

// These interfaces are meant to partially mirror the formats provided
// in our other libraries to avoid circular imports.
export interface RestServer {
  start(): Promise<void>;
  endpoint: {
    url?: string;
  };
}
