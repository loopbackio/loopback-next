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
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
): Client {
  const server = http.createServer(handler);
  return supertest(server);
}

/**
 * Create a SuperTest client for a running RestApplication instance.
 * It is the responsibility of the caller to ensure that the app
 * is running and to stop the application after all tests are done.
 * @param app - A running (listening) instance of a RestApplication.
 */
export function createRestAppClient(app: RestApplicationLike) {
  const url = app.restServer.rootUrl || app.restServer.url;
  if (!url) {
    throw new Error(
      `Cannot create client for ${app.constructor.name}, it is not listening.`,
    );
  }
  return supertest(url);
}

/*
 * These interfaces are meant to partially mirror the formats provided
 * in our other libraries to avoid circular imports.
 */

export interface RestApplicationLike {
  restServer: RestServerLike;
}

export interface RestServerLike {
  url?: string;
  rootUrl?: string;
}
