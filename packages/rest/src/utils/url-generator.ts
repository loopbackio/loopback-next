// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerObject} from '@loopback/openapi-spec-types';

/**
 * Describe the options for generating an OpenAPI 3.0.0 standard server url
 */
export interface ServerOptions {
  basePath?: string;
  description?: string;
  hostname?: string;
  protocal?: string;
  port?: number;
}

/**
 * Function to generate an OpenAPI 3.0.0 standard server object
 * as a string url.
 * @param serverOptions The options that match interface `ServerOptions`
 */
export function createServerAsUrl(serverOptions: ServerOptions): ServerObject {
  return {
    url: `${serverOptions.protocal}://${serverOptions.hostname}:${
      serverOptions.port
    }${serverOptions.basePath}`,
    description: `${serverOptions.description}` || 'A LoopBack rest server.',
  };
}

// unused function, add it here for discussion:
// Which format of Url do we want now?
// I vote for the simple url since the rest server doesn't support multiple server ATM.
export function createServerAsTemplate(
  serverOptions: ServerOptions,
): ServerObject {
  return {
    url: '{protocal}://{hostname}:{port}{basePath}',
    description: 'The default LoopBack rest server',
    variables: {
      protocal: {
        default: 'http',
      },
      basePath: {
        default: (serverOptions && serverOptions.basePath) || '/',
      },
      port: {
        default:
          (serverOptions &&
            serverOptions.port &&
            serverOptions.port.toString()) ||
          '3000',
      },
      hostname: {
        default: (serverOptions && serverOptions.hostname) || 'localhost',
      },
    },
  };
}
