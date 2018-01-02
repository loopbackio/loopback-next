// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get} from '@loopback/rest';

export class HelloController {
  constructor() {}

  @get('/')
  hello() {
    return 'Hello World';
  }
}

export class WorldController {
  constructor() {}

  @get('/world')
  world() {
    return 'Hi from world controller';
  }
}
