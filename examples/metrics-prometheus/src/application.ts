// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-metrics-prometheus
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {MetricsComponent} from '@loopback/metrics';
import {RestApplication} from '@loopback/rest';

export class GreetingApplication extends BootMixin(RestApplication) {
  constructor(config: ApplicationConfig = {}) {
    super(config);
    this.projectRoot = __dirname;
    this.component(MetricsComponent);
  }

  async main() {
    await this.boot();
    await this.start();
  }
}
