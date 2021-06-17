// Copyright The LoopBack Authors 2018,2021. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Person} from '../models';

export class GreetController {
  basicHello(input: Person) {
    return `Hello, ${input?.name ?? 'World'}!`;
  }

  hobbyHello(input: Person) {
    return `${this.basicHello(input)} I heard you like ${
      input?.hobby ?? 'underwater basket weaving'
    }.`;
  }
}
