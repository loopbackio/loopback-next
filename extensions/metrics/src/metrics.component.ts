// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-metrics
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config,
  ContextTags,
  createBindingFromClass,
  inject,
} from '@loopback/context';
import {Application, Component, CoreBindings} from '@loopback/core';
import {metricsControllerFactory} from './controllers';
import {MetricsInterceptor} from './interceptors';
import {MetricsBindings} from './keys';
import {MetricsObserver, MetricsPushObserver} from './observers';
import {DEFAULT_METRICS_OPTIONS, MetricsOptions} from './types';

/**
 * A component providing metrics for Prometheus
 */
@bind({tags: {[ContextTags.KEY]: MetricsBindings.COMPONENT}})
export class MetricsComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    options: MetricsOptions = DEFAULT_METRICS_OPTIONS,
  ) {
    if (
      !options.defaultMetrics ||
      (options.defaultMetrics && !options.defaultMetrics.disabled)
    ) {
      this.application.lifeCycleObserver(MetricsObserver);
    }
    if (
      !options.pushGateway ||
      (options.pushGateway && !options.pushGateway.disabled)
    ) {
      this.application.lifeCycleObserver(MetricsPushObserver);
    }
    this.application.add(createBindingFromClass(MetricsInterceptor));
    if (!options.endpoint || (options.endpoint && !options.endpoint.disabled)) {
      this.application.controller(
        metricsControllerFactory(options.endpoint && options.endpoint.basePath),
      );
    }
  }
}
