// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Autocannon, EndpointStats} from '../autocannon';
import {Scenario} from '../benchmark';
import {Client} from '../client';

export class CreateTodo implements Scenario {
  async setup(client: Client) {
    // no-op
  }

  execute(autocannon: Autocannon): Promise<EndpointStats> {
    return autocannon.execute('createTodo', '/todos', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Finish this',
        desc: 'Finish running this benchmark.',
      }),
    });
  }
}
