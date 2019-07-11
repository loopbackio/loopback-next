// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope, Constructor, inject} from '@loopback/core';
import {get, Response, RestBindings} from '@loopback/rest';
import {register} from 'prom-client';

export function metricsControllerFactory(
  basePath = '/metrics',
): Constructor<unknown> {
  @bind({scope: BindingScope.SINGLETON})
  class MetricsController {
    @get(basePath, {
      responses: {},
      'x-visibility': 'undocumented',
    })
    report(@inject(RestBindings.Http.RESPONSE) res: Response) {
      // Set the content type from the register
      res.contentType(register.contentType);
      res.send(register.metrics());
      return res;
    }
  }

  return MetricsController;
}
