// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, Constructor, inject, injectable} from '@loopback/core';
import {
  get,
  OperationObject,
  Response,
  ResponseObject,
  RestBindings,
} from '@loopback/rest';
import {register} from 'prom-client';
import {DEFAULT_METRICS_OPTIONS, MetricsOptions} from '../types';

/**
 * OpenAPI definition of metrics response
 */
const METRICS_RESPONSE: ResponseObject = {
  description: 'Metrics Response',
  content: {
    'text/plain': {
      schema: {
        type: 'string',
      },
    },
  },
};

/**
 * OpenAPI spec for metrics endpoint
 */
const METRICS_SPEC: OperationObject = {
  responses: {
    '200': METRICS_RESPONSE,
  },
};

/**
 * OpenAPI spec to hide endpoints
 */
const HIDDEN_SPEC: OperationObject = {
  responses: {},
  'x-visibility': 'undocumented',
};

export function metricsControllerFactory(
  options: MetricsOptions = DEFAULT_METRICS_OPTIONS,
): Constructor<unknown> {
  const basePath = options.endpoint?.basePath ?? '/metrics';
  const spec = options.openApiSpec ? METRICS_SPEC : HIDDEN_SPEC;

  /**
   * Controller for metrics endpoint
   */
  @injectable({scope: BindingScope.SINGLETON})
  class MetricsController {
    @get(basePath, spec)
    async report(@inject(RestBindings.Http.RESPONSE) res: Response) {
      // Set the content type from the register
      res.contentType(register.contentType);
      const data = await register.metrics();
      res.send(data);
      return res;
    }
  }

  return MetricsController;
}
