// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-rpc-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Person} from '../models';

export class GreetController {
  basicHello(input: Person) {
    return `Hello, ${(input && input.name) || 'World'}!`;
  }

  hobbyHello(input: Person) {
    return `${this.basicHello(input)} I heard you like ${(input &&
      input.hobby) ||
      'underwater basket weaving'}.`;
  }
}
