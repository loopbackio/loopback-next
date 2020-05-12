// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {FastifyServerConfig} from './fastify.config';

/**
 * RestServer-specific bindings
 */
export namespace FastifyBindings {
  /**
   * Binding key for setting and injecting RestComponentConfig
   */
  export const CONFIG = CoreBindings.APPLICATION_CONFIG.deepProperty<
    FastifyServerConfig
  >('fastify');
}
