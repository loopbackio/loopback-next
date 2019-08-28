// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-metrics-prometheus
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, ContextTags} from '@loopback/core';
import {promisify} from 'util';
const sleep = promisify(setTimeout);

@bind({tags: {[ContextTags.NAMESPACE]: 'services'}})
export class GreetingService {
  async greet(name: string) {
    const ts = new Date().toISOString();
    // Delay for a random duration between 0 and 100ms
    const delayInMs = Math.floor(Math.random() * 100);
    await sleep(delayInMs);
    return `[${ts}: ${delayInMs}] Hello, ${name}`;
  }
}
