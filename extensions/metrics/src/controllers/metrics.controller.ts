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
const metricsResponse: ResponseObject = {
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
const metricsSpec: OperationObject = {
  responses: {
    '200': metricsResponse,
  },
};

/**
 * OpenAPI spec to hide endpoints
 */
const hiddenSpec: OperationObject = {
  responses: {},
  'x-visibility': 'undocumented',
};

export function metricsControllerFactory(
  options: MetricsOptions = DEFAULT_METRICS_OPTIONS,
): Constructor<unknown> {
  const basePath = options.endpoint?.basePath ?? '/metrics';
  const spec = options.openApiSpec ? metricsSpec : hiddenSpec;

  /**
   * Controller for metrics endpoint
   */
  @injectable({scope: BindingScope.SINGLETON})
  class MetricsController {
    @get(basePath, spec)
    report(@inject(RestBindings.Http.RESPONSE) res: Response) {
      // Set the content type from the register
      res.contentType(register.contentType);
      res.send(register.metrics());
      return res;
    }
  }

  return MetricsController;
}
