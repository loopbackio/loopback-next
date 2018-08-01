// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Autocannon, EndpointStats} from '../autocannon';
import {Scenario} from '../benchmark';
import {Client} from '../client';

export class FindTodos implements Scenario {
  async setup(client: Client) {
    await client.createTodo({
      title: 'first item',
      desc: 'Do something first',
    });

    await client.createTodo({title: 'Second item'});
  }

  execute(autocannon: Autocannon): Promise<EndpointStats> {
    return autocannon.execute('findTodos', '/todos');
  }
}
