// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import Fastify from 'fastify';

export type FastifyServerOptions = Partial<FastifyServerResolvedOptions>;

export interface FastifyServerResolvedOptions {
  port: number;
}

/**
 * Valid configuration for the FastifyServer constructor.
 */
export type FastifyServerConfig = FastifyServerOptions &
  Fastify.ServerOptions &
  Fastify.ListenOptions;

export type FastifyServerResolvedConfig = FastifyServerResolvedOptions &
  Fastify.ServerOptions &
  Fastify.ListenOptions;

export function resolveFastifyServerConfig(
  config: FastifyServerConfig,
): FastifyServerResolvedConfig {
  return {port: 3000, ...config};
}
