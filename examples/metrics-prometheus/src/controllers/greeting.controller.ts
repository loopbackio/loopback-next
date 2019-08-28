// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-metrics-prometheus
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {GreetingService} from '../services';

export class GreetingController {
  constructor(
    @inject('services.GreetingService', {asProxyWithInterceptors: true})
    private greetingService: GreetingService,
  ) {}

  @get('/greet/{name}')
  async greet(
    @param.path.string('name') name: string,
    @param.query.number('count') count = 1,
  ) {
    const tasks: Promise<string>[] = [];
    for (let i = 0; i < count; i++) {
      tasks.push(this.greetingService.greet(name));
    }
    return Promise.all(tasks);
  }
}
